'use server'
import { dimensionsForRatio } from '@/sdk/constants'
import { ImageResponse } from '@vercel/og'
import sharp from 'sharp'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from './farcaster'

export async function buildFramePage({
    id,
    buttons,
    aspectRatio,
    inputText,
    refreshPeriod,
    params,
    fonts,
    component,
    image,
    handler,
    linkedPage,
}: {
    id: string
    linkedPage: string | undefined
} & BuildFrameData) {
    if (!(component || image)) {
        throw new Error('Either component or image must be provided')
    }

    let imageData

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

    const metadata = await buildFrame({
        buttons,
        image: imageData,
        aspectRatio,
        inputText,
        refreshPeriod,
        postUrl: `${process.env.NEXT_PUBLIC_HOST}/f/${id}`,
        handler: handler,
        searchParams: searchParams,
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

    return frame
}

export async function buildPreviewFramePage({
    id,
    buttons,
    aspectRatio,
    inputText,
    refreshPeriod,
    params,
    fonts,
    component,
    image,
    handler,
}: {
    id: string
} & BuildFrameData) {
    if (!component && !image) {
        throw new Error('Either component or image must be provided')
    }

    let imageData

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

    const metadata = await buildFrame({
        buttons,
        image: imageData,
        aspectRatio,
        inputText,
        refreshPeriod,
        postUrl: `${process.env.NEXT_PUBLIC_HOST}/p/${id}`,
        handler: handler,
        searchParams: searchParams,
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

    return frame
}

export async function buildFrame({
    buttons,
    image,
    aspectRatio = '1.91:1',
    inputText,
    postUrl,
    refreshPeriod,
    version = 'vNext',
    handler,
    searchParams,
}: {
    buttons: FrameButtonMetadata[]
    image: string
    aspectRatio?: '1.91:1' | '1:1'
    inputText?: string
    postUrl: string
    refreshPeriod?: number
    version?: string
    handler?: string
    searchParams?: string
}) {
    // Regular expression to match the pattern YYYY-MM-DD
    if (!(version === 'vNext' || /^\d{4}-\d{2}-\d{2}$/.test(version))) {
        throw new Error('Invalid version.')
    }

    const metadata: Record<string, string> = {
        'fc:frame': version,
        // 'og:image': image,
        'fc:frame:image': image,
        'fc:frame:image:aspect_ratio': aspectRatio,
        'fc:frame:post_url': postUrl + `/${handler}` + '?' + searchParams,
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

                if (button.action === 'tx') {
                    metadata[`fc:frame:button:${index + 1}:target`] =
                        postUrl + `/${button.handler || handler}` + '?' + searchParams
                    if (button.callback) {
                        metadata[`fc:frame:button:${index + 1}:post_url`] =
                            postUrl + `/${button.callback}` + '?' + searchParams
                    }
                }
                if (button.action === 'link' || button.action === 'mint') {
                    metadata[`fc:frame:button:${index + 1}:target`] = button.target
                }
            } else {
                metadata[`fc:frame:button:${index + 1}:action`] = 'post' // Default action
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
export async function validatePayloadAirstack(
    body: FrameActionPayload,
    airstackKey: string
): Promise<FrameValidatedActionPayload | { valid: false; message: undefined }> {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-airstack-hubs': airstackKey,
        },
        body: new Uint8Array(
            body.trustedData.messageBytes.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16))
        ),
    }

    const r = (await fetch('https://hubs.airstack.xyz/v1/validateMessage', options)
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            return {
                valid: false,
                message: undefined,
            }
        })) as FrameValidatedActionPayload

    return r
}
