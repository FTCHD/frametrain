import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'

export interface Token {
    address: string
    symbol: string
    decimals: number
}

export interface PortfolioToken extends Token {
    balance: string
    percentage: number
}

export interface Config extends BaseConfig {
    walletAddress: string
    chainId: number
    whitelistedTokens: Token[]
    blacklistedTokens: Token[]
    maxTokens: number
    gating: GatingType
    useBasicViewForCover: boolean
    useBasicViewForSuccess: boolean
}

export interface Storage extends BaseStorage {
    portfolioValue: string
    portfolioTokens: PortfolioToken[]
    transactions: {
        hash: string
        status: 'pending' | 'success' | 'failed'
    }[]
}

export interface CopytradingTemplate extends BaseTemplate {
    name: string
    description: string
    initialConfig: Config
}
