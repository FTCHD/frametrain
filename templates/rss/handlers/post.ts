'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchRssFeed, fetchRssFeedCover, type RssFeed } from '../utils/rss'
import PostView from '../views/Post'
import initial from './initial'
import { FrameError } from '@/sdk/error'
import { dayjs } from '../utils/dayjs'

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
    const fid = body.untrustedData.fid.toString()

    const buttonIndex = body.untrustedData.buttonIndex
    let newStorage = storage

    let nextPage: number
    let lastUpdated: number | null =
        params?.lastUpdated === undefined ? null : Number.parseInt(params.lastUpdated)

    if (!config.rssUrl || buttonIndex === 1) {
        const diff = dayjs().diff(dayjs(lastUpdated), 'minute')
        if (buttonIndex === 1 && params?.initial && diff > 10) {
            const info = await fetchRssFeedCover(`${config.rssUrl}`)
            return initial({
                config,
                params: { info },
                storage: {
                    ...newStorage,
                    [fid]: {},
                },
            })
        }
        return initial({ config })
    }

    const existingPosts = storage[fid]?.[config.rssUrl]

    let feed: RssFeed

    try {
        if (!existingPosts) {
            feed = await fetchRssFeed(config.rssUrl)
            newStorage = {
                ...newStorage,
                [fid]: {
                    ...(newStorage[fid] ?? {}),
                    [config.rssUrl]: feed,
                },
            }
            lastUpdated = feed.lastUpdated
        } else {
            // making sure to not fetch the feed again if it hasn't been updated
            if (
                !(Number.isNaN(lastUpdated) && Number.isNaN(existingPosts.lastUpdated)) &&
                lastUpdated === existingPosts.lastUpdated
            ) {
                feed = existingPosts
            } else {
                feed = await fetchRssFeed(config.rssUrl)
                newStorage = {
                    ...newStorage,
                    [fid]: {
                        ...(newStorage[fid] ?? {}),
                        [config.rssUrl]: feed,
                    },
                }
                lastUpdated = feed.lastUpdated
            }
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
        params: { currentPage: nextPage, lastUpdated },
    }
}
