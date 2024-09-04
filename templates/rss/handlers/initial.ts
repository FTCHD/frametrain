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
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.fontFamily) {
        fontSet.add(config.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if (config.rssUrl) {
        const existingPosts = storage?.feed

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
