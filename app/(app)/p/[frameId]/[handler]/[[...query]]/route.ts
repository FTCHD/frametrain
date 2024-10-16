import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { updateFramePreview } from '@/lib/frame'
import { buildPreviewFramePage } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import { FrameError } from '@/sdk/error'
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
    { params }: { params: { frameId: string; handler: string } }
) {
    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        if (!['frameId', 'handler'].includes(key)) {
            searchParams[key] = value
        }
    })

    const frame = await client
        .select()
        .from(frameTable)
        .where(eq(frameTable.id, params.frameId))
        .get()

    if (!frame) {
        notFound()
    }

    if (!frame.draftConfig) {
        notFound()
    }

    const template = templates[frame.template]

    const validatedPayload = (await request.json()) as FramePayloadValidated

    type ValidHandler = Omit<typeof template.handlers, 'initial'>

    const handlerFn = template.handlers[params.handler as keyof ValidHandler]

    if (!handlerFn) {
        notFound()
    }

    let buildParameters = {} as BuildFrameData

    try {
        buildParameters = await handlerFn({
            body: validatedPayload,
            config: frame.draftConfig as BaseConfig,
            storage: frame.storage as BaseStorage,
            params: searchParams,
        })
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

    const renderedFrame = await buildPreviewFramePage({
        id: frame.id,
        buttons: buildParameters.buttons,
        aspectRatio: buildParameters.aspectRatio,
        inputText: buildParameters.inputText,
        refreshPeriod: buildParameters.refreshPeriod,
        params: buildParameters.params,
        fonts: buildParameters.fonts,
        component: buildParameters.component,
        image: buildParameters.image,
        handler: buildParameters.handler,
    })

    if (
        frame.updatedAt.getTime() < Date.now() - ms('5m') ||
        frame.updatedAt.getTime() === frame.createdAt.getTime()
    ) {
        await updateFramePreview(frame.id, renderedFrame)
    }

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
