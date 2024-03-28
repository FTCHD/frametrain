'use server'
import type {
    FarcasterUserInfo,
    FrameActionPayload,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from './farcaster'
import type { BaseConfig } from './types'

export async function buildFramePage({
    ...args
}: {
    buttons?: FrameButtonMetadata[]
    image: string
    aspectRatio: '1.91:1' | '1:1'
    inputText?: string
    refreshPeriod?: number
    function?: string
    params?: any
    config: BaseConfig
}) {
    const searchParams =
        args?.params !== undefined
            ? Object.entries(args.params)
                  .map(([key, value]) => `${key}=${value}`)
                  .join('&')
            : ''

    const metadata = buildFrame({
        ...args,
        postUrl: (await getPostRoute(args.config.frameId, args.function)) + '?' + searchParams,
    })

    // console.log('[buildFramePage]', metadata)

    return `<html lang="en">
	<head>
	 ${Object.keys(metadata)
         .map((key) => `<meta property="${key}" content="${metadata[key]}" />`)
         .join('\n')}
	  <title>🚂 FrameTrain</title>
	</head>
	<body>
	  <h1>🚂 FrameTrain</h1>
	</body>
  </html>
	`
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
    buttons?: FrameButtonMetadata[]
    image: string
    aspectRatio: '1.91:1' | '1:1'
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
                if (!['post', 'post_redirect', 'mint', 'link'].includes(button.action)) {
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

export async function getPostRoute(id: string, slideName?: string) {
    return `${process.env.NEXT_PUBLIC_HOST}/f/${id}/${slideName}`
}

// NEYNAR
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

export async function getInfoForFids(fids: string[]): Promise<FarcasterUserInfo[]> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }

    const r = (await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`,
        options
    )
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            return {
                isValid: false,
                message: undefined,
            }
        })) as { users: FarcasterUserInfo[] }

    const { users } = r

    return users
}
