'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '../types'
import { fetchPodcastData } from '../utils/rss'
import EpisodeView from '../views/Episode'

export default async function episode({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const podcastData = await fetchPodcastData(config.rssFeedUrl)
    const { episodes, title: podcastTitle } = podcastData
    const maxIndex = episodes.length - 1

    let episodeIndex = Math.min(Math.max(storage.currentEpisodeIndex, 0), maxIndex)

    if (body.buttonIndex === 1) {
        episodeIndex = Math.max(0, episodeIndex - 1)
    } else if (body.buttonIndex === 2) {
        episodeIndex = Math.min(maxIndex, episodeIndex + 1)
    }

    const currentEpisode = episodes[episodeIndex]

    const buttons = [
        { label: 'Back', action: 'post' },
        { label: 'Next', action: 'post' },
        {
            label: 'Share',
            action: 'post_redirect',
            target: `warpcast://share?embed=${encodeURIComponent(
                `https://frametra.in/${body.frameId}/episode/${episodeIndex}`
            )}`,
        },
        {
            label: 'Open Episode',
            action: 'link',
            target: currentEpisode.url,
        },
    ]

    return {
        buttons,
        component: EpisodeView({ episode: currentEpisode, podcastTitle }),
        handler: 'episode',
        state: { currentEpisodeIndex: episodeIndex },
    }
}
