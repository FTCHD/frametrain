import { http, createPublicClient, type Chain, isAddress } from 'viem'
import { base, mainnet, optimism, arbitrum, fantom, polygon, bsc } from 'viem/chains'

export { isAddress }

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
type ChainExplorer = {
    name: string
    id: number
    explorer: NonNullable<Chain['blockExplorers']>[string]
}

export const chainExplorerByHostname: Record<string, ChainExplorer> = {}
export const chainByChainId: Record<number, Chain> = {}

if (Object.keys(chainByChainId).length === 0) {
    for (const [name, chain] of Object.entries(chains)) {
        chainByChainId[chain.id] = chain
        if (Object.keys(chain.blockExplorers).length > 0) break
        for (const explorer of Object.values((chain as Chain).blockExplorers ?? {})) {
            const hostname = new URL(explorer.url).hostname
            chainExplorerByHostname[hostname] = {
                name,
                id: (chain as Chain).id,
                explorer,
            }
        }
    }
}

export function getViemClient(chainId: number) {
    const chain = chainByChainId[chainId]

    if (!chain) {
        throw new Error('Unsupported chain')
    }

    return createPublicClient({
        chain,
        transport: http(),
        batch: { multicall: { wait: 10, batchSize: 1000 } },
    })
}
