import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import type { BuildFrameData, FramePayload } from '@/lib/farcaster'
import { updateFrameStorage } from '@/lib/frame'
import { buildFramePage, validatePayload } from '@/lib/serve'
import type { BaseConfig, BaseStorage } from '@/lib/types'
import { FrameError } from '@/sdk/error'
import templates from '@/templates'
import { waitUntil } from '@vercel/functions'
import { type InferSelectModel, eq } from 'drizzle-orm'
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

    const payload = (await request.json()) as FramePayload

    const handlerFn = template.handlers[params.handler as keyof typeof template.handlers]

    if (!handlerFn) {
        notFound()
    }
	
    const validatedPayload = await validatePayload(payload)

    let buildParameters = {} as BuildFrameData

    try {
        buildParameters = await handlerFn({
            frame: {
                id: frame.id,
                owner: frame.owner,
            },
            body: validatedPayload,
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

        console.error(error)

        return Response.json(
            { message: 'Unknown error' },
            {
                status: 500,
            }
        )
    }

    if (buildParameters.transaction) {
        waitUntil(processFrame(frame, buildParameters, payload))

        return new Response(JSON.stringify(buildParameters.transaction), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    if (buildParameters.frame) {
        waitUntil(processFrame(frame, buildParameters, payload))

        const html = await fetch(buildParameters.frame).then((res) => res.text())

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        })
    }

    const renderedFrame = await buildFramePage({
        id: frame.id,
        linkedPage: frame.linkedPage || undefined,
        ...(buildParameters as BuildFrameData),
    })

    waitUntil(processFrame(frame, buildParameters, payload))

    return new Response(renderedFrame, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}

async function processFrame(
    frame: InferSelectModel<typeof frameTable>,
    parameters: BuildFrameData,
    payload: FramePayload
) {
    const storageData = parameters.storage as BaseStorage | undefined

    if (storageData) {
        await updateFrameStorage(frame.id, storageData)
    }

    if (frame.webhooks) {
        const webhookUrls = frame.webhooks

        if (!webhookUrls) {
            return
        }

        for (const webhook of parameters?.webhooks || []) {
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
    }

}
