'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'
import { fetchRssFeed, type RssFeed, toReadableDate } from '../common'
import { FrameError } from '@/sdk/error'

export default async function initial({
    config,
    params,
    storage,
}: {
    config: Config
    storage?: Storage
    params?: {
        info?: {
            title: string
            total: number
            lastUpdated: number
        }
    }
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    let info: RssFeed | null = null
    const buttons: FrameButtonMetadata[] = []
    let newStorage = storage

    if (params?.info) {
        console.log('initial handler refreshed', params)
        info = {
            title: params.info.title,
            posts: [],
            lastUpdated: {
                ts: params.info.lastUpdated,
                human: toReadableDate(params.info.lastUpdated),
            },
        }
    } else {
        if (config.rssUrl) {
            const existingPosts = storage?.feed

            try {
                if (!existingPosts) {
                    info = await fetchRssFeed(config.rssUrl)
                    newStorage = {
                        feed: info,
                    }
                    console.log('initial handler fetched', info)
                } else {
                    info = existingPosts
                }

                buttons.push(
                    { label: 'Refresh' },
                    {
                        label: 'Read',
                    }
                )
            } catch {
                console.error('Failed to fetch RSS feed')
                throw new FrameError(`Failed to fetch RSS feed for ${config.rssUrl}`)
            }
        }
    }
    return {
        storage: newStorage,
        buttons,
        fonts: roboto,
        component: CoverView({ info, config }),
        handler: 'post',
        params: info ? { lastUpdated: info.lastUpdated.ts, initial: true } : undefined,
    }
}
