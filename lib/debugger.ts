import toast from 'react-hot-toast'
import { z } from 'zod'
import type {
    FrameImageMetadata,
    FrameMetadataType,
    FramePayloadValidated,
    FrameRequest,
} from './farcaster'
import type { MockOptions } from './store'

export async function simulateCall(
    postUrl: string,
    requestPayload: FrameRequest | undefined,
    mockOptions: MockOptions
) {
    const timestamp = new Date().toISOString()
    const isRecasted = Boolean(mockOptions.recasted)
    const isLiked = Boolean(mockOptions.liked)
    const isFollower = Boolean(mockOptions.follower)
    const isFollowing = Boolean(mockOptions.following)

    let res

    if (requestPayload) {
        const validatedPayload: FramePayloadValidated = {
            object: 'validated_frame_action',
            url: requestPayload.untrustedData.url,
            interactor: {
                object: 'user',
                fid: requestPayload.untrustedData.fid,
                custody_address: '0x02ef790dd7993a35fd847c053eddae940d055596',
                username: 'frametrain',
                display_name: 'FrameTrain',
                pfp_url: 'https://i.imgur.com/3d6fFAI.png',
                profile: {
                    bio: {
                        text: 'The Frames Builder',
                        mentioned_profiles: [],
                    },
                },
                follower_count: 0,
                following_count: 0,
                verifications: [],
                verified_addresses: {
                    eth_addresses: [],
                    sol_addresses: [],
                },
                active_status: 'inactive',
                power_badge: false,
                viewer_context: {
                    following: isFollowing,
                    followed_by: isFollower,
                },
            },
            tapped_button: { index: requestPayload.untrustedData.buttonIndex },
            state: {
                serialized: requestPayload.untrustedData.state || '',
            },
            cast: {
                object: 'cast',
                hash: '0x0000000000000000000000000000000000000001',
                fid: requestPayload.untrustedData.fid,
                author: {
                    object: 'user',
                    fid: requestPayload.untrustedData.fid,
                    custody_address: '0x02ef790dd7993a35fd847c053eddae940d055596',
                    username: 'warpcast',
                    display_name: 'Warpcast',
                    pfp_url: 'https://i.imgur.com/3d6fFAI.png',
                    profile: {
                        bio: {
                            text: 'A Farcaster client',
                            mentioned_profiles: [],
                        },
                    },
                    follower_count: 0,
                    following_count: 0,
                    verifications: [],
                    verified_addresses: {
                        eth_addresses: [],
                        sol_addresses: [],
                    },
                    active_status: 'inactive',
                    power_badge: false,
                },
                text: 'Simulated Cast',
                timestamp: timestamp,
                embeds: [],
                reactions: { likes_count: 0, recasts_count: 0, likes: [], recasts: [] },
                replies: { count: 0 },
                mentioned_profiles: [],
                viewer_context: { liked: isLiked, recasted: isRecasted },
            },
            timestamp: timestamp,
            signer: {
                client: {
                    object: 'user',
                    fid: 9152,
                    custody_address: '0x02ef790dd7993a35fd847c053eddae940d055596',
                    username: 'warpcast',
                    display_name: 'Warpcast',
                    pfp_url: 'https://i.imgur.com/3d6fFAI.png',
                    profile: {
                        bio: {
                            text: 'A Farcaster client',
                            mentioned_profiles: [],
                        },
                    },
                    follower_count: 7379,
                    following_count: 50,
                    verifications: [],
                    verified_addresses: {
                        eth_addresses: [],
                        sol_addresses: [],
                    },
                    active_status: 'inactive',
                    power_badge: false,
                },
            },
        }

        if (requestPayload.untrustedData?.inputText !== '') {
            validatedPayload.input = {
                text: requestPayload.untrustedData.inputText,
            }
        }

        const options: RequestInit | undefined = requestPayload
            ? {
                  method: 'POST',
                  body: JSON.stringify(validatedPayload),
                  redirect: 'manual',
              }
            : undefined

        res = await fetch(postUrl, options)
    } else {
        res = await fetch(postUrl)
    }

    if (res.status !== 200) {
        try {
            const message = await res.json().then((json) => json.message)
            toast.error(message)
        } catch {}
        return
    }

    // if (res.status === 302) {
    //     const redirectUrl = res.headers.get('Location')
    //     window.location.href = json.redirectUrl
    // 	   return
    // }

    return res.text()
}

////////////////////////////////////////////////

export function parseFrameHtml(html: string) {
    const document = new DOMParser().parseFromString(html, 'text/html')
    const ogImage = document.querySelectorAll(`[property='og:image']`)
    const frameMetaTagsProperty = document.querySelectorAll(`[property^='fc:frame']`)
    const frameMetaTagsName = document.querySelectorAll(`[name^='fc:frame']`)
    const nameTags = Object.assign([], frameMetaTagsName)
    const propertyTags = Object.assign([], ogImage, frameMetaTagsProperty)
    const tags: Record<string, string> = {}

    function processTag(tag: Element, keyName: 'property' | 'name') {
        const key = tag.getAttribute(keyName)
        const value = tag.getAttribute('content')
        if (key && value) {
            tags[key] = value
        }
    }

    for (const nameTag of nameTags) {
        processTag(nameTag, 'name')
    }
    for (const propertyTag of propertyTags) {
        processTag(propertyTag, 'property')
    }

    const parseResult = vNextSchema.safeParse(tags)
    const isValid = parseResult.success
    const errors = parseResult.success ? {} : parseResult.error.flatten().fieldErrors
    const metadata = frameResultToFrameMetadata(tags as FrameVNext)

    return { isValid, errors, tags, metadata }
}

export type FrameMetadataWithImageObject = FrameMetadataType & {
    image: FrameImageMetadata
}

export function frameResultToFrameMetadata(
    result: Record<string, string>
): FrameMetadataWithImageObject {
    const postUrl = result['fc:frame:post_url']
    const buttons = [1, 2, 3, 4].map((idx) =>
        result[`fc:frame:button:${idx}`]
            ? {
                  action: result[`fc:frame:button:${idx}:action`] || 'post',
                  label: result[`fc:frame:button:${idx}`],
                  target: result[`fc:frame:button:${idx}:target`] || postUrl,
              }
            : undefined
    )
    const imageSrc = result['fc:frame:image']
    const imageAspectRatio = result['fc:frame:image:aspect_ratio']
    const inputText = result['fc:frame:input:text']
    const input = inputText ? { text: inputText } : undefined
    const rawState = result['fc:frame:state']
    const rawRefreshPeriod = result['fc:frame:refresh_period']
    const refreshPeriod = rawRefreshPeriod ? Number.parseInt(rawRefreshPeriod, 10) : undefined
    const state = rawState ? JSON.parse(decodeURIComponent(result['fc:frame:state'])) : undefined

    return {
        buttons: buttons as any,
        image: { src: imageSrc, aspectRatio: imageAspectRatio as any },
        input,
        postUrl,
        state,
        refreshPeriod,
    }
}

////////////////////////////////////////////////
// https://x.com/puruvjdev/status/1720322766241738896

const buttonActionSchema = z.enum(['post', 'post_redirect', 'mint', 'link', 'tx'])
const aspectRatioSchema = z.enum(['1:1', '1.91:1'])

const createButtonSchemas = () => {
    const schemas: Record<string, z.ZodString | z.ZodOptional<z.ZodString>> = {}

    for (let i = 1; i <= 4; i++) {
        schemas[`fc:frame:button:${i}`] = z.string().optional()
        schemas[`fc:frame:button:${i}:action`] = buttonActionSchema.optional()
        schemas[`fc:frame:button:${i}:target`] = z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 256, {
                message: 'button target has maximum size of 256 bytes',
            })
    }

    return schemas
}

export const vNextSchema = z
    .object({
        'fc:frame': z.string().regex(/vNext/, { message: '"fc:frame" must be "vNext"' }),
        'fc:frame:image': z.string(),
        'og:image': z.string(),
        ...createButtonSchemas(),
        'fc:frame:post_url': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 256, {
                message: 'post_url has maximum size of 256 bytes',
            }),
        'fc:frame:input:text': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 32, {
                message: 'input:text has maximum size of 32 bytes',
            }),
        'fc:frame:image:aspect_ratio': aspectRatioSchema.optional(),
        'fc:frame:state': z
            .string()
            .optional()
            .refine((value) => new Blob([value!]).size <= 4096, {
                message: 'frame:state has maximum size of 4096 bytes',
            }),
    })
    .refine(
        (data: any) => {
            for (let i = 2; i <= 4; i++) {
                if (data[`fc:frame:button:${i}`] && !data[`fc:frame:button:${i - 1}`]) {
                    return false
                }
            }
            return true
        },
        { message: 'Button index values must be in sequence, starting at 1.' }
    )

export type FrameVNext = z.infer<typeof vNextSchema>
