'use server'
import { dimensionsForRatio } from '@/sdk/constants'
import { ImageResponse } from '@vercel/og'
import type { ReactElement } from 'react'
import sharp from 'sharp'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from './farcaster'
import type { BaseState } from './types'
import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export async function buildFramePage({
    id,
    buttons,
    aspectRatio,
    inputText,
    refreshPeriod,
    params,
    state,
    fonts,
    component,
    image,
    functionName,
    webhook,
    linkedPage,
}: {
    id: string
    linkedPage: string | undefined
} & BuildFrameData) {
    if (!component && !image) {
        throw new Error('Either component or image must be provided')
    }

    let imageData

    if (webhook) {
        triggerEvent(id, webhook.event, webhook.data).catch(console.log)
    }

    if (component) {
        const renderedImage = new ImageResponse(component, {
            ...dimensionsForRatio[aspectRatio === '1:1' ? '1/1' : '1.91/1'],
            fonts,
        })

        // get image data from vercel/og ImageResponse
        const bufferData = await renderedImage.arrayBuffer()

        // compress using sharp
        const compressedData = await sharp(bufferData)
            .png({
                quality: 40,
            })
            .timeout({ seconds: 1 })
            .toBuffer()

        imageData = 'data:image/png;base64,' + compressedData.toString('base64')
    } else {
        imageData = image!
    }

    const searchParams =
        params !== undefined
            ? Object.entries(params)
                  .map(([key, value]) => `${key}=${value}`)
                  .join('&')
            : ''

    const metadata = buildFrame({
        buttons,
        image: imageData,
        aspectRatio,
        inputText,
        refreshPeriod,
        postUrl: `${process.env.NEXT_PUBLIC_HOST}/f/${id}/${functionName}` + '?' + searchParams,
    })

    const frame = `<html lang="en">
	<head>
		${Object.keys(metadata)
            .map((key) => `<meta property="${key}" content="${metadata[key]}" />`)
            .join('\n')}
		<title>&#128642; FrameTrain</title>
		${linkedPage ? `<script>window.location.href = "${linkedPage}"</script>` : ''}
	</head>
	<style>
		* {
			background-color: #17101f;
		}
	</style>
	<body>
		<h1 style='color: #fff; font-family: system-ui;'>&#128642; Hello from FrameTrain</h1>
	</body>
	</html>
	`

    return {
        frame,
        state,
    }
}

export async function buildPreviewFramePage({
    id,
    buttons,
    aspectRatio,
    inputText,
    refreshPeriod,
    params,
    state,
    fonts,
    component,
    image,
    functionName,
    webhook,
}: {
    id: string
    buttons: FrameButtonMetadata[]
    aspectRatio: '1.91:1' | '1:1'
    inputText?: string
    refreshPeriod?: number
    params?: any
    state?: BaseState
    fonts?: any[]
    component: ReactElement
    image: string
    functionName?: string
    webhook?: {
        event: string
        data: Record<string, unknown>
    }
}) {
    if (!component && !image) {
        throw new Error('Either component or image must be provided')
    }

    let imageData

    if (webhook) {
        triggerEvent(id, webhook.event, webhook.data).catch(console.log)
    }

    if (component) {
        const renderedImage = new ImageResponse(component, {
            ...dimensionsForRatio[aspectRatio === '1:1' ? '1/1' : '1.91/1'],
            fonts,
        })

        // get image data from vercel/og ImageResponse
        const bufferData = Buffer.from(await renderedImage.arrayBuffer())
        imageData = 'data:image/png;base64,' + bufferData.toString('base64')
    } else {
        imageData = image!
    }

    const searchParams =
        params !== undefined
            ? Object.entries(params)
                  .map(([key, value]) => `${key}=${value}`)
                  .join('&')
            : ''

    const metadata = buildFrame({
        buttons,
        image: imageData,
        aspectRatio,
        inputText,
        refreshPeriod,
        postUrl: `${process.env.NEXT_PUBLIC_HOST}/p/${id}/${functionName}` + '?' + searchParams,
    })

    const frame = `<html lang="en">
	<head>
		${Object.keys(metadata)
            .map((key) => `<meta property="${key}" content="${metadata[key]}" />`)
            .join('\n')}
		<title>🚂 FrameTrain</title>
	</head>
	<body>
		<h1>Hello, 🚂 FrameTrain</h1>
	</body>
	</html>
	`

    return {
        frame,
        state,
    }
}

function buildFrame({
    buttons,
    image,
    aspectRatio = '1.91:1',
    inputText,
    postUrl,
    refreshPeriod,
    version = 'vNext',
}: {
    buttons: FrameButtonMetadata[]
    image: string
    aspectRatio?: '1.91:1' | '1:1'
    inputText?: string
    postUrl: string
    refreshPeriod?: number
    version?: string
}) {
    // Regular expression to match the pattern YYYY-MM-DD
    if (!(version === 'vNext' || /^\d{4}-\d{2}-\d{2}$/.test(version))) {
        throw new Error('Invalid version.')
    }

    const metadata: Record<string, string> = {
        'fc:frame': version,
        'og:image': image,
        'fc:frame:image': image,
        'fc:frame:image:aspect_ratio': aspectRatio,
        'fc:frame:post_url': postUrl,
    }

    if (inputText) {
        if (inputText.length > 32) {
            throw new Error('Input text exceeds maximum length of 32 bytes.')
        }
        metadata['fc:frame:input:text'] = inputText
    }

    if (buttons) {
        if (buttons.length > 4) {
            throw new Error('Maximum of 4 buttons allowed.')
        }
        buttons.forEach((button: FrameButtonMetadata, index: number) => {
            if (!button.label || button.label.length > 256) {
                throw new Error('Button label is required and must be maximum of 256 bytes.')
            }
            metadata[`fc:frame:button:${index + 1}`] = button.label
            if (button.action) {
                if (!['post', 'post_redirect', 'mint', 'link', 'tx'].includes(button.action)) {
                    throw new Error('Invalid button action.')
                }
                metadata[`fc:frame:button:${index + 1}:action`] = button.action
            } else {
                metadata[`fc:frame:button:${index + 1}:action`] = 'post' // Default action
            }
            if (button.target) {
                metadata[`fc:frame:button:${index + 1}:target`] = button.target
            }
        })
    }

    if (refreshPeriod) {
        if (refreshPeriod < 0) {
            throw new Error('Refresh period must be a positive number.')
        }
        metadata['fc:frame:refresh_period'] = refreshPeriod.toString()
    }

    return metadata
}

export async function validatePayload(
    body: FrameActionPayload
): Promise<FrameValidatedActionPayload> {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            cast_reaction_context: true,
            follow_context: true,
            signer_context: true,
            message_bytes_in_hex: body.trustedData.messageBytes,
        }),
    }

    const r = (await fetch('https://api.neynar.com/v2/farcaster/frame/validate', options)
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            return {
                isValid: false,
                message: undefined,
            }
        })) as FrameValidatedActionPayload

    return r
}

function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

/**
 * @name triggerEvent
 *
 * A function that sends webhook info based on the event type and the data.
 * It sends a POST request to the webhook url.
 * There's a limit of 3 tries at an interval of 5 seconds each
 *
 * @param frameId string - the frame id
 * @param event string - an object of the event name and external url
 * @param data object - data to be sent with the event
 * @returns Promise<void>
 */
async function triggerEvent(frameId: string, event: string, data: Record<string, unknown>) {
    const frame = await client
        .select()
        .from(frameTable)
        .where(and(eq(frameTable.id, frameId)))
        .get()

    if (!frame?.webhooks) {
        return
    }

    // where frame.webhooks is a list of webhook objects with structure as {[eventName]: webhookUrl}
    // get the webhook url for the event
    const webhookUrl = frame.webhooks[event] as string | undefined

    if (!webhookUrl) {
        return
    }

    const id = crypto.randomUUID()

    for (let i = 0; i <= 3; i++) {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    event,
                    data: {
                        ...data,
                        createdAt: new Date().toISOString(),
                    },
                }),
            })
            console.log(
                `[triggerEvent|OK] >> Successfully sent event data to ${webhookUrl} for ${event}`
            )

            return response
        } catch (error) {
            console.log(
                `[triggerEvent|ERROR] >> failed to send data to ${webhookUrl} for ${event}`,
                error
            )

            if (i < 3) {
                console.log(`[triggerEvent|ERROR] >> Retry ${i + 1}/3 after 5 seconds...`)
                await sleep(5)
            } else {
                console.log('[triggerEvent|ERROR] >> Retry failed')
            }
        }
    }
}
