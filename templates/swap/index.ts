import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { TextViewProps } from '@/sdk/views/TextView'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

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
    success: TextViewProps & {
        image?: string
    }
    background: string
    coverMessage?: TextViewProps['title']
    pairName?: TextViewProps['title']
}

export interface Storage extends BaseStorage {
    livePriceData: Record<string, { price: number; lastUpdated: number }>
}

export default {
    name: 'Swap',
    description: 'Enable followers to Swap tokens straight from a Frame, with no extra fees.',
    shortDescription: 'For any Uniswap poll',
    icon: icon,
    octicon: 'rocket',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        background: '#000000',
        amounts: [],
        enablePredefinedAmounts: false,
        pool: null,
        success: {
            title: { text: 'Transaction was successful!' },
            subtitle: { text: 'Your swap has been completed.' },
            bottomMessage: { text: 'We appreciate your support.' },
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
