import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

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
    description: 'From tweet or thread to Frame in seconds, with unlimited customization.',
    shortDescription: 'Unroll, on Farcaster',
    icon: icon,
    octicon: 'north-star',
    creatorFid: '368382',
    creatorName: 'Chris',
    enabled: true,
    Inspector,
    handlers,
    cover,
    initialConfig: {},
    events: [],
} satisfies BaseTemplate
