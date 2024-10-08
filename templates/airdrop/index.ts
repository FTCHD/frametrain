import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import Inspector from './Inspector'
import cover from './cover.png'
import handlers from './handlers'

export type LinkButton = {
    action: 'link'
    label: string
    target: string
}
export type BackgroundType = 'color' | 'gradient' | 'image'

export interface Config extends BaseConfig {
    tokenAddress: string

    chain: keyof typeof airdropChains
    walletAddress: string
    generalAmount: number
    whitelist: {
        address: string
        amount: number
    }[]
    cover: {
        background: string
        headerColor: string
        headerText: string
        subHeaderColor: string
        subHeaderText: string
    }
    blacklist: string[]
    cooldown: number
    creatorId: number | null

    buttons: [] | [LinkButton] | [LinkButton, LinkButton] | [LinkButton, LinkButton, LinkButton]
    gating: GatingType | undefined
    enableGating: boolean | undefined
}

const defaultConfig: Config = {
    tokenAddress: '',
    chain: 'base',
    walletAddress: '',
    generalAmount: 0,
    whitelist: [],
    blacklist: [],
    cooldown: -1,
    creatorId: null,
    cover: {
        background: '#ff75c3',
        headerColor: '#ffe83f',
        headerText: 'Airdropper',
        subHeaderText: "You're here to receive your free tokens",
        subHeaderColor: '#ffffff',
    },
    claimed: {
        text: '',
        links: [],
    },
    buttons: [],
    gating: {
        enabled: [],
        requirements: {
            maxFid: 0,
            minFid: 0,

            channels: [],
            exactFids: [],
        },
    },
    enableGating: false,
}

export const airdropChains = {
    base: 8453,
    polygon: 137,
    ethereum: 1,
    optimism: 10,
    arbitrum: 42161,
}

export interface Storage extends BaseStorage {
    users: Record<
        string,
        {
            fid: string
            username: string
            claimed: boolean
            earnings: number
            lastUsage: number
        }
    >
    totalAmountEarned: number
}

const config: BaseTemplate = {
    name: 'Airdrop',
    description: 'Create an airdrop for farcasters users to claim in a frame',
    shortDescription:
        'Create an airdrop specifically for Farcaster users, allowing them to seamlessly claim tokens or assets within a dedicated frame interface.',
    octicon: 'megaphone',
    creatorFid: '213144',
    creatorName: 'Complexlity',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: defaultConfig,
    events: [],
}

export default config
