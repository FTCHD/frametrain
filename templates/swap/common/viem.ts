import { createPublicClient, http } from 'viem'
import type { Chain as ViewChain } from 'viem'
import { base, mainnet, optimism, arbitrum } from 'viem/chains'

/**
 * Network	Chain ID
Ethereum	eip155:1
Arbitrum	eip155:42161
Base	eip155:8453
Degen	eip155:666666666
Gnosis	eip155:100
Optimism	eip155:10
Zora	eip155:7777777
 */

/** Support chains */
export const chains = ['ethereum', 'optimism', 'arbitrum', 'base'] as const
export type Chain = (typeof chains)[number]
export const chainsByChainId: Record<number, string> = {
    1: 'eth',
    10: 'optimism',
    42161: 'arbitrum',
    8453: 'base',
}

export const supportedChains = chains
    .map((chain) => `${chain.charAt(0).toUpperCase()}${chain.slice(1)}`)
    .join(', ')

/** Get client for chain id */
export function getClientByChainId(chainId: number) {
    const chainIdToChainMap: Record<number, ViewChain> = {
        1: mainnet,
        8453: base,
        10: optimism,
        42161: arbitrum,
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
