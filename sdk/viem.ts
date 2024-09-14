import { http, type Chain, createPublicClient } from 'viem'
import {
    arbitrum,
    base,
    blast,
    bsc,
    degen,
    fantom,
    gnosis,
    mainnet,
    optimism,
    polygon,
    zora,
} from 'viem/chains'

/*
Network			Chain ID
Ethereum		eip155:1
Arbitrum		eip155:42161
Base			eip155:8453
Degen			eip155:666666666
Gnosis			eip155:100
Optimism		eip155:10
Zora			eip155:7777777
Polygon 		eip155:137
Blast 			eip155:10001
Fantom 			eip155:250
BSC 			eip155:56
*/
export const supportedChains: {
    key:
        | 'mainnet'
        | 'base'
        | 'optimism'
        | 'zora'
        | 'arbitrum'
        | 'degen'
        | 'gnosis'
        | 'polygon'
        | 'blast'
        | 'fantom'
        | 'bsc'
    label: string
    id: number
}[] = [
    {
        key: 'mainnet',
        label: 'Ethereum',
        id: 1,
    },
    {
        key: 'optimism',
        label: 'Optimism',
        id: 10,
    },
    {
        key: 'base',
        label: 'Base',
        id: 8453,
    },
    {
        key: 'zora',
        label: 'Zora',
        id: 7777777,
    },
    {
        key: 'arbitrum',
        label: 'Arbitrum',
        id: 42161,
    },
    {
        key: 'degen',
        label: 'Degen',
        id: 666666666,
    },
    {
        key: 'gnosis',
        label: 'Gnosis',
        id: 100,
    },
    {
        key: 'polygon',
        label: 'Polygon',
        id: 137,
    },
    {
        key: 'blast',
        label: 'Blast',
        id: 10001,
    },
    {
        key: 'fantom',
        label: 'Fantom',
        id: 250,
    },
    {
        key: 'bsc',
        label: 'BSC',
        id: 56,
    },
]

export type ChainKey = (typeof supportedChains)[number]['key']

export function getViem(chainKey: ChainKey) {
    const chainKeyToChain: Record<ChainKey, Chain> = {
        'mainnet': mainnet,
        'arbitrum': arbitrum,
        'base': base,
        'degen': degen,
        'gnosis': gnosis,
        'optimism': optimism,
        'zora': zora,
        'polygon': polygon,
        'blast': blast,
        'fantom': fantom,
        'bsc': bsc,
    }

    const chain = chainKeyToChain[chainKey]

    if (!chain) {
        throw new Error('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}