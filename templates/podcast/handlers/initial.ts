'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config, Storage } from '../types'
import { fetchPodcastData } from '../utils/rss'
import CoverView from '../views/Cover'

export default async function initial({
    body,
    config,
    storage,
}: {
    body: undefined
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const podcastData = await fetchPodcastData(config.rssFeedUrl)

    return {
        buttons: [
            { label: 'Episodes', action: 'post' },
            { label: 'Latest Episode', action: 'post' },
        ],
        component: CoverView({ config, podcastData }),
        handler: 'episodes',
    }
}
