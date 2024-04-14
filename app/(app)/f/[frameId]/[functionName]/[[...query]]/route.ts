import { frameTable } from '@/db/schema'
import { updateFrameCalls, updateFramePreview, updateFrameState } from '@/lib/actions'
import type { FrameActionPayload, FrameActionPayloadUnion } from '@/lib/farcaster'
import { validatePayload } from '@/lib/sdk'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const runtime = 'edge'
export const fetchCache = 'force-no-store'

export async function POST(
    request: NextRequest,
    { params }: { params: { frameId: string; functionName: string } }
) {
    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        if (!['frameId', 'functionName'].includes(key)) {
            searchParams[key] = value
        }
    })

    const db = drizzle(getRequestContext().env.DB)

    const frame = await db.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        console.error('No frame')
        notFound()
    }

    if (!frame.config) {
        console.error('No config')
        notFound()
    }

    const template = templates[frame.template]
	
    console.log('Got template', JSON.stringify(template).substring(0, 20))

    let body: FrameActionPayload | FrameActionPayloadUnion =
        (await request.json()) as FrameActionPayload

    console.log('Got body', JSON.stringify(body).substring(0, 20))

    const isPreview = Object.keys(body).includes('mockFrameData')

    type ValidSlide = Omit<typeof template.functions, 'initial'>

    const handler = template.functions[params.functionName as keyof ValidSlide]

    if (!handler) {
        notFound()
    }
	
	const configWithMetadata = Object.assign({}, frame.config, {
        frameId: frame.id,
        requiresValidation: template.requiresValidation,
    })

    if (!isPreview && configWithMetadata.requiresValidation) {
        console.log('frame requires validation')

        body = Object.assign({}, body, {
            validatedData: await validatePayload(body),
        })
		
        if (!(body as FrameActionPayloadUnion).validatedData.valid) {
            throw new Error('NOT VALID')
        }
    } else {
        console.log('frame does not require validation')
    }

    const { frame: rFrame, state: rState } = await handler(
        body,
        configWithMetadata as any,
        frame.state as typeof template.initialState,
        searchParams
    )

    console.log('rState', rState)

    // biome-ignore lint/style/noNegationElse: <>
    if (!isPreview) {
        await updateFrameState(frame.id, rState)
        await updateFrameCalls(frame.id, frame.currentMonthCalls + 1)
        console.log('Updated frame state and action count')
    } else {
        await updateFramePreview(frame.id, rFrame)
    }

    // console.log('rFrame', rFrame)

    console.log('RETURNING REPONSE')

    return new Response(rFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
