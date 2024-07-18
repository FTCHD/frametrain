import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

type Token = {
    address: `0x${string}`
    symbol: string
    decimals: number
    name: string
}

export interface Config extends BaseConfig {
    enablePredefinedAmounts: boolean
    amounts: string[]
    pool: {
        address: `0x${string}`
        token0: Token
        token1: Token
        network: {
            id: number
            name: string
        }
    } | null
}

export interface Storage extends BaseStorage {}

export default {
    name: 'FrameSwap',
    description: 'Create your own Token Swap Frame',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        text: 'Default Text',
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
