import { frameTable } from '@/db/schema'
import { updateFrameCalls, updateFramePreview, updateFrameState } from '@/lib/frame'
import type { FrameActionPayload, FrameActionPayloadUnion } from '@/lib/farcaster'
import { buildFramePage, validatePayload } from '@/lib/serve'
import type { BaseConfig, BaseState } from '@/lib/types'
import templates from '@/templates'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import ms from 'ms'
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
        notFound()
    }

    if (!frame.config) {
        notFound()
    }

    const template = templates[frame.template]

    let body: FrameActionPayload | FrameActionPayloadUnion =
        (await request.json()) as FrameActionPayload

    type ValidSlide = Omit<typeof template.functions, 'initial'>

    const handler = template.functions[params.functionName as keyof ValidSlide]

    if (!handler) {
        notFound()
    }

    if (template.requiresValidation) {
        body = Object.assign({}, body, {
            validatedData: await validatePayload(body),
        })

        if (!(body as FrameActionPayloadUnion).validatedData.valid) {
            throw new Error('PAYLOAD NOT VALID')
        }
	}

    const buildParameters = await handler(
        body,
		frame.config as BaseConfig,
        frame.state as BaseState,
        searchParams
    )
	
	// state can be taken directly from the handler
	// no need to pass it back and forth in the future
	const { frame: renderedFrame, state: newState } = await buildFramePage({ id: frame.id, ...buildParameters })

	if (newState) {
		await updateFrameState(frame.id, newState)
		console.log('Updated frame state')
	}
	await updateFrameCalls(frame.id, frame.currentMonthCalls + 1)
	console.log('Updated frame action count')

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
