import type { NetworkConfig } from './types'

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
    {
        chainId: 8453,
        name: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        tokens: {
            MOXIE: {
                address: '0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527',
                symbol: 'MOXIE',
                decimals: 18,
            },
            DEGEN: {
                address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
                symbol: 'DEGEN',
                decimals: 18,
            },
            USDC: {
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                symbol: 'USDC',
                decimals: 6,
            },
            WETH: {
                address: '0x4200000000000000000000000000000000000006',
                symbol: 'WETH',
                decimals: 18,
            },
        },
    },
    {
        chainId: 10,
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        tokens: {
            OP: {
                address: '0x4200000000000000000000000000000000000042',
                symbol: 'OP',
                decimals: 18,
            },
            USDC: {
                address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                symbol: 'USDC',
                decimals: 6,
            },
            WETH: {
                address: '0x4200000000000000000000000000000000000006',
                symbol: 'WETH',
                decimals: 18,
            },
        },
    },
]

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS[0]

export const PAYMENT_OPTIONS = ['ETH', 'USDC', 'OP']

export const MAX_TOKENS_LIMIT = 10

export const API_BASE_URL = 'https://api.0x.org'
