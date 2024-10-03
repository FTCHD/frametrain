export type Config = {
    rssFeedUrl: string
    customCoverImage?: string
    gating?: any
}

export type Storage = {
    currentEpisodeIndex: number
}

export type Episode = {
    title: string
    description: string
    pubDate: string
    duration: string
    url: string
}

export type PodcastData = {
    title: string
    description: string
    imageUrl: string
    episodes: Episode[]
}
