import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameActionPayloadValidated,
} from '@/lib/farcaster'
import { updateFramePreview } from '@/lib/frame'
import { buildPreviewFramePage } from '@/lib/serve'
import type { BaseConfig, BaseState } from '@/lib/types'
import { FrameError } from '@/sdk/handlers'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
import ms from 'ms'
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

    if (!frame.draftConfig) {
        notFound()
    }

    const template = templates[frame.template]

    const body: FrameActionPayload | FrameActionPayloadValidated =
        (await request.json()) as FrameActionPayload

    type ValidSlide = Omit<typeof template.functions, 'initial'>

    const handler = template.functions[params.functionName as keyof ValidSlide]

    if (!handler) {
        notFound()
    }
	
	let buildParameters = {} as BuildFrameData

    try {
        buildParameters = await handler(
            body,
            frame.draftConfig as BaseConfig,
            frame.state as BaseState,
            searchParams
        )
    } catch (error) {
        if (error instanceof FrameError) {
            return Response.json(
                { message: error.message },
                {
                    status: 400,
                }
            )
        }

        return Response.json(
            { message: 'Unknown error' },
            {
                status: 500,
            }
        )
    }


    const { frame: renderedFrame } = await buildPreviewFramePage({
        id: frame.id,
        ...buildParameters,
    })

    if (frame.updatedAt.getTime() < Date.now() - ms('5m')) {
        await updateFramePreview(frame.id, renderedFrame)
    }

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
