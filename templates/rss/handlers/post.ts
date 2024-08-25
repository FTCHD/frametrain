'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import ms from 'ms'
import type { Config, Storage } from '..'
import { fetchRssFeed } from '../common'
import PostView from '../views/Post'
import initial from './initial'

export default async function post({
    body,
    config,
    storage,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants('Roboto')

    const buttonIndex = body.untrustedData.buttonIndex

    let nextPage: number
    const existingPosts = storage?.feed

    // redirect to cover view if no rss url or no existing posts
    if (!(config.rssUrl && existingPosts)) {
        return initial({ config })
    }

    // when clicked on refresh button from cover view
    if (
        buttonIndex === 1 &&
        params?.initial === 'true' &&
        Date.now() - existingPosts.lastUpdated.ts > ms('10m')
    ) {
        const feed = await fetchRssFeed(`${config.rssUrl}`)
        const { lastUpdated: updatedAt, ...info } = feed
        return initial({
            config,
            params: {
                info: {
                    total: info.posts.length,
                    title: info.title,
                    lastUpdated: updatedAt.ts,
                },
            },
            storage: {
                feed,
            },
        })
    }

    if (buttonIndex === 2 && !params?.currentPage) {
        nextPage = 1
    } else {
        nextPage =
            params?.currentPage !== undefined
                ? buttonIndex === 2
                    ? Number(params.currentPage) - 1
                    : Number(params.currentPage) + 1
                : 1
    }
    const post = existingPosts.posts[nextPage - 1]

    return {
        aspectRatio: '1:1',
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
                target: post.link,
            },
        ],
        component: PostView({
            post,
            total: existingPosts.posts.length,
            postIndex: nextPage,
            config,
        }),
        handler: 'post',
        fonts,
        storage,
        params: { currentPage: nextPage },
    }
}
