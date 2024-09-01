import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import type { RssFeed } from './common'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    rssUrl: string | null
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    coverBackground?: string
    pageBackground?: string
}

export interface Storage extends BaseStorage {
    feed: RssFeed | undefined
}

export default {
    name: 'RSS',
    description: "Turn any RSS feed into a Farcaster Frame that's always up to date.",
    shortDescription: 'Sync any feed, free!',
    icon: icon,
    octicon: 'flame',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        rssUrl: null,
        primaryColor: '#ffffff',
        secondaryColor: '#ffe83f',
        fontFamily: 'Roboto',
        coverBackground: '#000000',
        pageBackground: '#000000',
    },
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
