'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchRssFeed, type RssFeed } from '../rss'
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
    const fid = body.untrustedData.fid.toString()

    const buttonIndex = body.untrustedData.buttonIndex
    let newStorage = storage

    let nextPage: number

    if (!config.rssUrl || (buttonIndex === 1 && params?.currentPage)) {
        return initial({ config })
    }

    const existingPosts = storage[fid]?.[config.rssUrl]

    let feed: RssFeed

    if (!existingPosts) {
        feed = await fetchRssFeed(config.rssUrl)
        newStorage = {
            ...newStorage,
            [fid]: {
                ...(newStorage[fid] ?? {}),
                [config.rssUrl]: feed,
            },
        }
    } else {
        feed = existingPosts
    }

    if (buttonIndex === 2 && !params?.currentPage) {
        nextPage = 1
    } else {
        nextPage =
            params?.currentPage !== undefined
                ? buttonIndex === 1
                    ? Number(params.currentPage) - 1
                    : Number(params.currentPage) + 1
                : 1
    }
    const post = feed.body[nextPage - 1]

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
        component: PostView({ post, total: feed.body.length, postIndex: nextPage }),
        handler: 'post',
        fonts,
        storage: newStorage,
        params: { currentPage: nextPage },
    }
}
