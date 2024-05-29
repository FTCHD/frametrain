import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

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

export interface State extends BaseState {
    votesForId: Record<string, number>
	votesForOption: Record<string, number>
	totalVotes: number
}

export default {
    name: 'Poll Template',
    description: 'Create your own Poll as a Farcaster Frame.',
    creatorFid: '3',
    creatorName: 'Dan',
    enabled: true,
    Inspector,
    functions,
    cover,
    requiresValidation: true,
} satisfies BaseTemplate
