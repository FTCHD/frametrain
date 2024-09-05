import type { Chain } from 'viem'
import { arbitrum, base, bsc, fantom, mainnet, optimism, polygon } from 'viem/chains'

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

for (const [name, chain] of Object.entries(chains)) {
    chainByChainId[chain.id] = chain
    for (const explorer of Object.values((chain as Chain).blockExplorers ?? {})) {
        const hostname = new URL(explorer.url).hostname
        chainExplorerByHostname[hostname] = {
            name,
            id: (chain as Chain).id,
            explorer,
        }
    }
}