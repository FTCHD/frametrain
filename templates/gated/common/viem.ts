import { http, createPublicClient, type Chain } from 'viem'
import { base, mainnet, optimism, zora, blast, arbitrum, fantom, polygon, bsc } from 'viem/chains'

export function getViemClient(network: string) {
    const networkToChainMap: Record<string, Chain> = {
        'ETH': mainnet,
        'BASE': base,
        'OP': optimism,
        'ZORA': zora,
        'BLAST': blast,
        'POLYGON': polygon,
        'FANTOM': fantom,
        'ARBITRUM': arbitrum,
        'BNB': bsc,
    }

    const chain = networkToChainMap[network]

    if (!chain) {
        throw new Error('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}
