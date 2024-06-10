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

    const nextPage =
        params?.currentPage !== undefined
            ? body.untrustedData.buttonIndex === 2
                ? Number(params?.currentPage) - 1
                : Number(params?.currentPage) + 1
            : 1

    const discourseUrl = config.discourseLink + '.json'

    const postsIds = await fetch(discourseUrl)
        .then((res) => res.json())
        .then((res) => res.post_stream.stream)
        .catch(console.error)

    const postId = postsIds[nextPage - 1]

    const post = await fetch(`${config.discourseDomain}/posts/${postId}.json`).then((res) =>
        res.json()
    )

    if (!post?.raw) {
        return initial(config, state)
    }

    const urbanist = await loadGoogleFontAllVariants('Urbanist')
    const lato = await loadGoogleFontAllVariants('Lato')

    return {
        buttons: [
            {
                label: '&#x2302;',
            },
            {
                label: '&larr;',
            },
            {
                label: '&rarr;',
            },
        ],
        aspectRatio: '1:1',
        fonts: [...urbanist, ...lato],
        component: PostView(post),
        functionName: 'post',
        params: { currentPage: nextPage },
    }
}
