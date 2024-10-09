import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    numberOfStories: number
}

export interface Storage extends BaseStorage {
    viewedStories: number[]
}

export default {
    name: 'Hacker News',
    description: 'Browse top Hacker News stories in a Frame.',
    shortDescription: 'HN top stories',
    octicon: 'flame',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        numberOfStories: 5,
    },
    events: [],
} satisfies BaseTemplate
