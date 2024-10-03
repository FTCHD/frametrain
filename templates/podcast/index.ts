import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import * as handlers from './handlers'

export interface Config extends BaseConfig {
    rssFeedUrl: string
    customCoverImage?: string
    gating?: GatingType
    enableGating?: boolean
}

export interface Storage extends BaseStorage {
    currentEpisodeIndex: number
}

export default {
    name: 'Podcast',
    description: 'A template for displaying podcast information and episodes',
    shortDescription: 'Podcast + Farcaster',
    octicon: 'broadcast',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers: {
        initial: handlers.initial,
        page: handlers.page,
        episodes: handlers.episodes,
        episode: handlers.episode,
    },
    initialConfig: {
        rssFeedUrl: '',
        enableGating: false,
        gating: {
            enabled: [],
            requirements: {
                maxFid: 0,
                minFid: 0,
                score: 0,
                channels: [],
                exactFids: [],
                erc20: null,
                erc721: null,
                erc1155: null,
                moxie: null,
            },
        },
    },
    events: ['podcast.episode.played'],
} satisfies BaseTemplate