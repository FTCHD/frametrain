'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { type RssFeed, fetchRssFeed } from '../common'
import CoverView from '../views/Cover'

export default async function initial({
    config,
    storage,
}: {
    config: Config
    storage?: Storage
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    let info: RssFeed | null = null
    let newStorage = storage
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.fontFamily) {
        const customMessageFont = await loadGoogleFontAllVariants(config.fontFamily)
        fonts.push(...customMessageFont)
    }

    if (config.rssUrl) {
        const existingPosts = storage?.feed
        console.log({ existingPosts: existingPosts?.posts.length })

        try {
            if (!existingPosts) {
                info = await fetchRssFeed(config.rssUrl)
                newStorage = {
                    feed: info,
                }
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
            throw new FrameError(`Failed to fetch RSS feed for ${config.rssUrl}`)
        }
    }
    return {
        storage: newStorage,
        buttons,
        fonts,
        component: CoverView({ info, config }),
        handler: 'post',
    }
}
