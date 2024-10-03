import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    betIdea: string
    deadline?: {
        date: string
        time: string
    }
    isPublic: boolean
    counterparty: string
    arbitrator: string
    backupArbitrator: string
    amount: number
    currency: string
    supportedCurrencies: string[]
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    background?: string
    gating?: GatingType
    enableGating?: boolean
    fid?: number
}

export interface Storage extends BaseStorage {
    counterpartyAddress?: string
    winner?: 'user' | 'counterparty'
    betAccepted: boolean
}

export default {
    name: 'Bet',
    description: 'Create and manage bets with friends on Farcaster',
    shortDescription: 'P2P Bets on Farcaster',
    octicon: 'comment-discussion',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        betIdea: '',
        isPublic: true,
        counterparty: '',
        arbitrator: '',
        backupArbitrator: '',
        amount: 0,
        currency: 'ETH',
        supportedCurrencies: ['ETH', 'USDC', 'USDT'],
        enableGating: false,
        gating: {
            enabled: [],
            requirements: {
                maxFid: 0,
                minFid: 0,
                score: 0,
                channels: [],
                exactFids: [],
                erc20: null,
                erc721: null,
                erc1155: null,
                moxie: null,
            },
        },
    },
    initialStorage: {
        betAccepted: false,
    },
    events: ['bet.accepted', 'bet.resolved'],
} satisfies BaseTemplate
