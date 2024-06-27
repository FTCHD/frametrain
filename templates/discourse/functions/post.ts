'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import PostView from '../views/Post'
import initial from './initial'

export default async function post(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const buttonIndex = body.untrustedData.buttonIndex

    if (buttonIndex === 1 && params?.currentPage) {
        return initial(config, state)
    }

    let nextPage: number

    const postsIds = await fetch(config.discourseJson)
        .then((res) => res.json())
        .then((res) => res.post_stream.stream)
        .catch(console.error)

    if (buttonIndex === 2 && !params?.currentPage) {
        nextPage = postsIds.length
    } else {
        nextPage =
            params?.currentPage !== undefined
                ? body.untrustedData.buttonIndex === 2
                    ? Math.max(1, Number(params?.currentPage) - 1)
                    : Math.min(postsIds.length, Number(params?.currentPage) + 1)
                : 1
    }

    const postId = postsIds[nextPage - 1]

    const post = await fetch(`${config.discourseDomain}/posts/${postId}.json`)
        .then((r) => r.json())
        .catch(console.error)

    if (!post?.raw) {
        return initial(config, state)
    }

    const textFont = await loadGoogleFontAllVariants(config.textFont || 'Lato')
    const highlightFont = await loadGoogleFontAllVariants(config.highlightFont || 'Urbanist')

    return {
        buttons: [
            {
                label: '🏠',
            },
            {
                label: '⬅️',
            },
            {
                label: '➡️',
            },
            {
                label: 'View',
                action: 'link',
                target: config.discourseLink + '/' + post.post_number,
            },
        ],
        aspectRatio: '1:1',
        fonts: [...textFont, ...highlightFont],
        component: PostView({
            post,
            postCount: postsIds.length,
            postNumber: nextPage,
            backgroundColor: config.backgroundColor,
            textFont: config.textFont,
            textColor: config.textColor,
            highlightFont: config.highlightFont,
            highlightColor: config.highlightColor,
        }),
        functionName: 'post',
        params: { currentPage: nextPage },
    }
}
