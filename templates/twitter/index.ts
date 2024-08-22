import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'

export interface Config extends BaseConfig {
    tweets: Record<string, any>[]
    profile?: string
    title: {
        text?: string
        color?: string
        fontFamily?: string
        fontWeight?: string
        fontStyle?: string
    }
    bottom: {
        text?: string
        color?: string
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Tweet',
    description: 'Transform a tweet or multiple tweets into a Frame.',
    shortDescription: 'Unroll on Farcaster',
    icon: 'north-star',
    creatorFid: '368382',
    creatorName: 'Chris',
    enabled: true,
    Inspector,
    handlers,
    cover,
    initialConfig: {},
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
