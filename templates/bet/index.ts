import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import { ChainKey } from '@/sdk/viem'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export type Address = `0x${string}`

export type Role = 'owner' | 'opponent' | 'arbitrator' | 'user'

export interface Token {
    id: Address
    name: string
}

export interface User {
    username: string
    fid?: number
    wallet_address?: Address
    pfp_url?: string
}

export interface Config extends BaseConfig {
    background?: string
    textColor?: string
    privacy: boolean
    claim: string
    owner: User | null
    opponent: User | null
    arbitrator: User | null
    chain: ChainKey
    token: Token
    amount: number
    deadline: number
}

export interface Storage extends BaseStorage {
    opponentAccepted: boolean
    winner?: 'owner' | 'opponent' | null
    arbitrateTimestamp?: number
}

export default {
    name: 'Bet',
    description: 'Bet and Win',
    shortDescription: 'Appears as composer action description (max 20 characters)',
    octicon: 'gear', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '301841',
    creatorName: 'Kevin Lin (kevinsslin)',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        privacy: false,
        claim: 'I bet you that ...',
        owner: null,
        opponent: null,
        arbitrator: null,
        chain: 'base',
        amount: 0,
    },
    events: [],
} satisfies BaseTemplate
