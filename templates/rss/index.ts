import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { RssFeed } from './utils/rss'

export interface Config extends BaseConfig {
    rssUrl: string | null
    info?: {
        title: string
        total: number
        lastUpdated: number
    }
}

export interface Storage extends BaseStorage {
    [fid: string]: Record<string, RssFeed> | undefined
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
