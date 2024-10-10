'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchPodcastData } from '../utils/rss'
import EpisodeView from '../views/Episode'

export default async function page({
    config,
    storage,
    params,
}: {
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config.fontFamily || 'Roboto')

    const podcastData = await fetchPodcastData(config.rssFeedUrl)
    const episodeIndex = storage.currentEpisodeIndex || 0
    const episode = podcastData.episodes[episodeIndex]

    return {
        buttons: [
            { label: '←' },
            { label: 'Next' },
            {
                label: 'Share',
                action: 'post_redirect',
                target: `warpcast://share?text=${encodeURIComponent(episode.title)}`,
            },
            { label: 'Listen', action: 'link', target: episode.url },
        ],
        fonts,
        imageAspectRatio: '1:1',
        component: EpisodeView({ episode, podcastTitle: podcastData.title }),
        handler: 'episode',
    }
}
