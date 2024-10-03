import BasicView from '@/sdk/views/BasicView'
import type { Episode } from '../types'

export default function EpisodeView({
    episode,
    podcastTitle,
}: { episode: Episode; podcastTitle: string }) {
    return (
        <BasicView
            title={episode.title}
            subtitle={`${podcastTitle} - ${new Date(episode.pubDate).toLocaleDateString()} (${
                episode.duration
            })`}
            bottomText={episode.description}
        />
    )
}
