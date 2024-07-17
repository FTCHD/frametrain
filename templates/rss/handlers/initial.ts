'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import { fetchRssFeed, type RssFeedIntro } from '../rss'
import { FrameError } from '@/sdk/error'

export default async function initial({
    config,
}: {
    // GET requests don't have a body.
    config: Config
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    let feed: RssFeedIntro | null = null
    const buttons: FrameButtonMetadata[] = []

    try {
        if (config.rssUrl) {
            const rssFeed = await fetchRssFeed(config.rssUrl)
            feed = {
                title: rssFeed.title,
                updatedAt: rssFeed.updatedAt,
                total: rssFeed.body.length,
            }

            buttons.push({
                label: 'Read',
            })
        }
    } catch (e) {
        console.error('Failed to fetch rss feed', e)
        throw new FrameError('An error occurred while fetching rss feed')
    }

    return {
        buttons,
        fonts: roboto,
        component: CoverView(feed),
        handler: 'post',
    }
}
