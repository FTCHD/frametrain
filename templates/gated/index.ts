import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

type ERC = {
    network: string
    address: string
    balance: number | null
}

export interface Config extends BaseConfig {
    username: string | null
    welcomeText: string | null
    rewardMessage: string | null
    rewardImage: string | null
    links: string[]
    requirements: {
        basic: {
            follower: boolean
            following: boolean
            liked: boolean
            casted: boolean
            eth: boolean
            sol: boolean
            power: boolean
        }
        channels: string[]
        maxFid: number
        score: number
        erc20: ERC | null
        erc721: ERC | null
        erc1155: ERC | null
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Gated',
    description: 'Create your own Gated Frame to reward your fans.',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        username: null,
        welcomeText: null,
        rewardMessage: null,
        rewardImage: null,
        links: [],
        requirements: {
            basic: {
                follower: false,
                following: false,
                liked: false,
                casted: false,
                eth: false,
                sol: false,
                power: false,
            },
            channels: [],
            maxFid: 0,
            score: 0,
            erc20: null,
            erc721: null,
            erc1155: null,
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
