import { http, createPublicClient, type Chain, isAddress } from 'viem'
import { base, mainnet, optimism, arbitrum, fantom, polygon, bsc } from 'viem/chains'

export { isAddress }

export function getViemClient(network: string) {
    const networkToChainMap: Record<string, Chain> = {
        'ETH': mainnet,
        'BASE': base,
        'OP': optimism,
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

export const chains = {
    base,
    mainnet,
    optimism,
    arbitrum,
    fantom,
    polygon,
    bsc,
}

export const apiKeyByChainId: Record<string, string> = {
    [mainnet.id]: `${process.env.ETHERSCAN_API_KEY}`,
    [base.id]: `${process.env.BASESCAN_API_KEY}`,
    [optimism.id]: `${process.env.OPSCAN_API_KEY}`,
    [arbitrum.id]: `${process.env.ARBSCAN_API_KEY}`,
    [fantom.id]: `${process.env.FANTOMSCAN_API_KEY}`,
    [polygon.id]: `${process.env.POLYGONSCAN_API_KEY}`,
    [bsc.id]: `${process.env.BSCSCAN_API_KEY}`,
}
