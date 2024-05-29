import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import type { FrameActionPayload, FrameActionPayloadValidated } from '@/lib/farcaster'
import { updateFrameCalls, updateFrameState } from '@/lib/frame'
import { buildFramePage, validatePayload } from '@/lib/serve'
import type { BaseConfig, BaseState } from '@/lib/types'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
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

    const frame = await client.select().from(frameTable).where(eq(frameTable.id, params.frameId)).get()

    if (!frame) {
        notFound()
    }

    if (!frame.config) {
        notFound()
    }

    const template = templates[frame.template]

    let body: FrameActionPayload | FrameActionPayloadValidated =
        (await request.json()) as FrameActionPayload

    const handler = template.functions[params.functionName as keyof typeof template.functions]

    if (!handler) {
        notFound()
    }

    if (template.requiresValidation) {
        const validatedBody = await validatePayload(body)
        if (!validatedBody.valid) {
            throw new Error('PAYLOAD NOT VALID')
        }
        body = Object.assign({}, body, {
            validatedData: validatedBody.action,
        })
    }
	
    const buildParameters = await handler(
        body,
        frame.config as BaseConfig,
        frame.state as BaseState,
        searchParams
    )

    // state can be taken directly from the handler
    // no need to pass it back and forth in the future
    const { frame: renderedFrame, state: newState } = await buildFramePage({
        id: frame.id,
        ...buildParameters,
    })

    if (newState) {
        await updateFrameState(frame.id, newState)
        console.log('Updated frame state')
    }
    await updateFrameCalls(frame.id, frame.currentMonthCalls + 1)

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
