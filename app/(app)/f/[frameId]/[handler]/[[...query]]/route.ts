import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameActionPayloadValidated,
} from '@/lib/farcaster'
import { getFrameWebhooks, updateFrameCalls, updateFrameStorage } from '@/lib/frame'
import { buildFramePage, validatePayload } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import { FrameError } from '@/sdk/error'
import templates from '@/templates'
import { eq } from 'drizzle-orm'
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

    if (!frame.config) {
        notFound()
    }

    const template = templates[frame.template]

    let body: FrameActionPayload | FrameActionPayloadValidated =
        (await request.json()) as FrameActionPayload

    const handlerFn = template.handlers[params.handler as keyof typeof template.handlers]

    if (!handlerFn) {
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

    let buildParameters = {} as BuildFrameData

    try {
        buildParameters = await handlerFn({
            body: body,
            config: frame.config as BaseConfig,
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

    const renderedFrame = await buildFramePage({
        id: frame.id,
        linkedPage: frame.linkedPage || undefined,
        ...(buildParameters as BuildFrameData),
    })

    const storageData = buildParameters.storage as BaseStorage | undefined

    if (storageData) {
        await updateFrameStorage(frame.id, storageData)
        console.log('Updated frame storage')
    }
    await updateFrameCalls(frame.id, frame.currentMonthCalls + 1)

    // Allow for important logic to get processed and don't wait for webhooks to finish
    if (buildParameters.webhooks?.length) {
        try {
            const webhookUrls = await getFrameWebhooks(frame.id)

            if (!webhookUrls) {
                return
            }

            for (const webhook of buildParameters.webhooks) {
                if (!webhookUrls?.[webhook.event]) {
                    continue
                }

                fetch(webhookUrls[webhook.event], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: webhook.event,
                        data: {
                            ...webhook.data,
                            createdAt: new Date().toISOString(),
                        },
                    }),
                })
                    .then(() => {
                        console.log('Sent webhook')
                    })
                    .catch((e) => {
                        console.error('Error sending webhook', e)
                    })
            }
        } catch {}
    }

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
