import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import type { RssFeed } from './common'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    rssUrl: string | undefined
}

export interface Storage extends BaseStorage {
    feed: RssFeed | undefined
    lastUpdated: number | undefined
}

export default {
    name: 'RSS',
    description: 'Turn any RSS feed into a Farcaster Frame.',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
