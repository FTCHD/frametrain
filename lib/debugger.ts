import type {
    FrameImageMetadata,
    FrameMetadataType,
    FrameRequest,
} from '@coinbase/onchainkit/frame'
import { z } from 'zod'

export async function getPreview(url: string) {
    try {
        const response = await fetch(url)
        const text = await response.text()
        return parseFrameHtml(text)
    } catch (error) {
        console.error('Error fetching frame:', error)
    }
}

export async function simulateCall(frameData: FrameRequest, options?: string[] | undefined) {
    const postUrl = frameData.untrustedData.url

    const debugPayload = {
        ...frameData,
    } as any

    if (options) {
        const timestamp = new Date().toISOString()
        const isRecasted = options?.includes('recasted')
        const isLiked = options?.includes('liked')
        const isFollower = options?.includes('follower')
        const isFollowing = options?.includes('following')

        debugPayload.verifiedData = {
            object: 'validated_frame_action',
            url: frameData.untrustedData.url,
            interactor: {
                object: 'user',
                fid: 368382,
                custody_address: null,
                username: null,
                display_name: null,
                pfp_url: null,
                profile: null,
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
            tapped_button: { index: frameData.untrustedData.buttonIndex },
            state: {
                serialized: frameData.untrustedData.state || '',
            },
            cast: {
                object: 'cast',
                hash: '0x0000000000000000000000000000000000000001',
                fid: 368382,
                author: {
                    object: 'user',
                    fid: 368382,
                    custody_address: null,
                    username: null,
                    display_name: null,
                    pfp_url: null,
                    profile: null,
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
                text: null,
                timestamp: timestamp,
                embeds: [['Object']],
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
                    profile: null,
                    follower_count: 7379,
                    following_count: 50,
                    verifications: [],
                    verified_addresses: null,
                    active_status: 'inactive',
                    power_badge: false,
                },
            },
        }
    }

    const res = await fetch(postUrl, {
        method: 'POST',
        body: JSON.stringify(debugPayload),
        redirect: 'manual',
    })

    // if (res.status === 302) {
    //     const redirectUrl = res.headers.get('Location')
    //     window.location.href = json.redirectUrl
    // 	   return
    // }

    const html = await res.text()

    return parseFrameHtml(html)
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
