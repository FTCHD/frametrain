import { createPublicClient, http } from 'viem'
import type { Chain as ViewChain } from 'viem'
import {
    base,
    mainnet,
    optimism,
    arbitrum,
    bsc,
    sepolia,
    celo,
    blast,
    avalanche,
} from 'viem/chains'

/** Support chains */
export const chains = [
    'ethereum',
    'optimism',
    'arbitrum',
    'bsc',
    'sepolia',
    'celo',
    'blast',
    'avalanche',
    'base',
] as const
export type Chain = (typeof chains)[number]

export function getClientByChainId(chainId: number) {
    const chainIdToChainMap: Record<number, ViewChain> = {
        1: mainnet,
        137: base,
        56: bsc,
        10: optimism,
        42161: arbitrum,
        11155111: sepolia,
        42220: celo,
        43114: avalanche,
        81457: blast,
    }

    const chain = chainIdToChainMap[chainId]
    if (!chain) {
        throw new Error('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}

/** Get client for chain */
export function getClient(chain: Chain) {
    const batch = { multicall: { wait: 10, batchSize: 1000 } }

    switch (chain) {
        case 'ethereum':
            return createPublicClient({
                chain: mainnet,
                transport: http(),
                batch,
            })

        case 'optimism':
            return createPublicClient({
                chain: optimism,
                transport: http(),
                batch,
            })

        case 'arbitrum':
            return createPublicClient({
                chain: arbitrum,
                transport: http(),
                batch,
            })

        case 'bsc':
            return createPublicClient({
                chain: bsc,
                transport: http(),
                batch,
            })

        case 'sepolia':
            return createPublicClient({
                chain: sepolia,
                transport: http(),
                batch,
            })

        case 'celo':
            return createPublicClient({
                chain: celo,
                transport: http(),
                batch,
            })

        case 'blast':
            return createPublicClient({
                chain: blast,
                transport: http(),
                batch,
            })

        case 'avalanche':
            return createPublicClient({
                chain: avalanche,
                transport: http(),
                batch,
            })

        case 'base':
            return createPublicClient({
                chain: base,
                transport: http(),
                batch,
            })

        default:
            throw new Error('Unsupported chain')
    }
}
