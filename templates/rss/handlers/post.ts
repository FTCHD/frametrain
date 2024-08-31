'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
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
    params: {
        currentPage: string
        cursor?: 'next' | 'prev'
    }
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = [
        {
            label: '🏠',
        },
        {
            label: '⬅️',
        },
    ]

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.fontFamily) {
        fontSet.add(config.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }
    const buttonIndex = body.untrustedData.buttonIndex

    let cursor = params.cursor
    const existingPosts = storage?.feed

    // redirect to cover view if no rss url or no existing posts
    if (!(config.rssUrl && existingPosts)) {
        return initial({ config })
    }

    switch (buttonIndex) {
        case 1: {
            // when clicked on refresh button from cover view
            if (
                params?.currentPage === undefined &&
                Date.now() - existingPosts.lastUpdated.ts > ms('10m')
            ) {
                const feed = await fetchRssFeed(config.rssUrl)
                storage.feed = feed
            }
            return initial({ config, storage })
        }

        case 3: {
            cursor = params.cursor
            break
        }

        default: {
            cursor = params.cursor === undefined ? 'next' : 'prev'
            break
        }
    }

    const currentPage =
        params?.currentPage === undefined
            ? 0
            : Number(params.currentPage) + (cursor === 'next' ? 1 : -1)

    if (currentPage < 0) {
        return initial({ config, storage })
    }

    const posts = existingPosts.posts.map((post, idx) => ({ index: idx + 1, ...post }))
    const post = posts[currentPage]

    if (currentPage < existingPosts.posts.length) {
        buttons.push({
            label: '➡️',
        })
    }

    return {
        aspectRatio: '1:1',
        buttons: [
            ...buttons,
            {
                label: 'View',
                action: 'link',
                target: post.link,
            },
        ],
        component: PostView({
            post,
            total: existingPosts.posts.length,
            postIndex: post.index,
            config,
        }),
        handler: 'post',
        fonts,
        storage,
        params: { currentPage, cursor },
    }
}
