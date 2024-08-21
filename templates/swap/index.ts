import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { TextSlideProps } from '@/sdk/components/TextSlide'

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
    success: TextSlideProps & {
        image?: string
    }
    backgroundColor: string
    coverMessage?: {
        text: string
        color: string
        weight: string
        size: string
        style: string
        font: string
    }
    pairName?: {
        text: string
        color: string
        weight: string
        size: string
        style: string
        font: string
    }
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
        backgroundColor: 'black',
        amounts: [],
        enablePredefinedAmounts: false,
        pool: null,
        success: {
            title: 'Transaction was successful!',
            subtitle: 'Your swap has been completed.',
            customMessage: 'We appreciate your support.',
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
