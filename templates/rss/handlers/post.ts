'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import ms from 'ms'
import type { Config, Storage } from '..'
import { type RssFeed, fetchRssFeed } from '../common'
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
    let newStorage = storage

    let nextPage: number
    const lastUpdated: number = newStorage.lastUpdated || 0

    if (!config.rssUrl || (buttonIndex === 1 && params?.currentPage)) {
        return initial({ config })
    }

    const existingPosts = storage?.feed

    let feed: RssFeed

    try {
        if (!existingPosts || Date.now() - lastUpdated > ms('10m')) {
            feed = await fetchRssFeed(config.rssUrl)
            newStorage = {
                feed: feed,
                lastUpdated: Date.now(),
            }
        } else {
            feed = existingPosts
        }
    } catch {
        throw new FrameError('Failed to fetch RSS feed')
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
    const post = feed.posts[nextPage - 1]

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
        component: PostView({ post, total: feed.posts.length, postIndex: nextPage }),
        handler: 'post',
        fonts,
        storage: newStorage,
        params: { currentPage: nextPage },
    }
}
