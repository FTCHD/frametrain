'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '../types'
import { fetchPodcastData } from '../utils/rss'
import EpisodeView from '../views/Episode'

export default async function episodes({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    try {
        await runGatingChecks(body, config.gating)
    } catch (error) {
        return FrameError("You don't have access to view episodes.")
    }

    const podcastData = await fetchPodcastData(config.rssFeedUrl)
    const episodeIndex = body.buttonIndex === 2 ? 0 : storage.currentEpisodeIndex || 0

    return {
        buttons: [
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
                target: podcastData.episodes[episodeIndex].url,
            },
        ],
        component: EpisodeView({
            episode: podcastData.episodes[episodeIndex],
            podcastTitle: podcastData.title,
        }),
        handler: 'episode',
        state: { currentEpisodeIndex: episodeIndex },
    }
}
