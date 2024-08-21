import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'
import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'

export interface Config extends BaseConfig {
    owner?: {
        username: string
        fid: number
    }
    options: {
        buttonLabel: string
        displayLabel: string
        index: number
    }[]
    question: string
    background?: string
    textColor?: string
    barColor?: string
    gating?: GatingOptionsProps['config']
    enableGating?: boolean
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
    icon: 'question',
    creatorFid: '3',
    creatorName: 'Dan',
    enabled: true,
    Inspector,
    handlers,
    cover,
    requiresValidation: true,
    initialConfig: {
        enableGating: false,
        gating: {
            channels: {
                checked: false,
                data: [],
            },
            followedBy: false,
            following: false,
            liked: false,
            recasted: false,
            eth: false,
            sol: false,
            powerBadge: false,
            maxFid: 0,
            score: 0,
            erc20: null,
            erc721: null,
            erc1155: null,
        },
    },
    events: [],
} satisfies BaseTemplate
