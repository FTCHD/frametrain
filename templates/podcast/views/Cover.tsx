import BasicView from '@/sdk/views/BasicView'
import type { Config, PodcastData } from '../types'

export default function CoverView({
    config,
    podcastData,
}: { config: Config; podcastData: PodcastData }) {
    return (
        <BasicView
            title={podcastData.title}
            subtitle={podcastData.description}
            bottomText="Click to view episodes"
            backgroundImage={config.customCoverImage || podcastData.imageUrl}
        />
    )
}
