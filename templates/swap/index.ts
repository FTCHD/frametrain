import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export type PoolToken = {
    address: `0x${string}`
    symbol: string
    decimals: number
    name: string
    logo: string
    id: number
}

export type PoolNetwork = {
    id: number
    name: string
    explorerUrl: string
}

export interface Config extends BaseConfig {
    enablePredefinedAmounts: boolean
    amounts: string[]
    pool: {
        address: `0x${string}`
        token0: PoolToken
        token1: PoolToken
        network: PoolNetwork
        // mainly used to determine which token is the primary token for the Inspector
        primary: 'token0' | 'token1'
    } | null
}

export interface Storage extends BaseStorage {}

export default {
    name: 'TokenSwap',
    description: 'Create your own Token Swap Frame',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        amounts: [],
        enablePredefinedAmounts: false,
        pool: null,
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
