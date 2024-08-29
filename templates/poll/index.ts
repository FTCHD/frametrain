import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'
import icon from './icon.png'

export interface Config extends BaseConfig {
    options: {
        buttonLabel: string
        displayLabel: string
        index: number
    }[]
    question: string
    background?: string
    textColor?: string
    barColor?: string
}

export interface Storage extends BaseStorage {
    votesForId: Record<string, { option: number; username: string; timestamp: number }>
    votesForOption: Record<string, number>
    totalVotes: number
}

export default {
    name: 'Poll',
    description: 'Create your own Poll as a Farcaster Frame.',
    shortDescription: 'Customizable Polls',
    octicon: 'question',
    icon: icon,
    creatorFid: '3',
    creatorName: 'Dan',
    enabled: true,
    Inspector,
    handlers,
    cover,
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
