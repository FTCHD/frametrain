import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

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

export interface State extends BaseState {}

export default {
    name: 'Tweet Template',
    description: 'Transform a tweet or multiple tweets into a Frame.',
    creatorFid: '368382',
    creatorName: 'Chris',
    enabled: true,
    Inspector,
    functions,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
