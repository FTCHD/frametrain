import type { Chain } from "viem";
import {
    arbitrum,
    base,
    bsc,
    fantom,
    mainnet,
    optimism,
    polygon,
} from "viem/chains";

export const chains = {
    base,
    mainnet,
    optimism,
    arbitrum,
    fantom,
    polygon,
    bsc,
};

type ChainExplorer = {
    name: string;
    id: number;
    explorer: NonNullable<Chain["blockExplorers"]>[string];
};

export const chainExplorerByHostname: Record<string, ChainExplorer> = {};
export const chainByChainId: Record<number, Chain> = {};

for (const [name, chain] of Object.entries(chains)) {
    chainByChainId[chain.id] = chain;
    for (
        const explorer of Object.values((chain as Chain).blockExplorers ?? {})
    ) {
        const hostname = new URL(explorer.url).hostname;
        chainExplorerByHostname[hostname] = {
            name,
            id: (chain as Chain).id,
            explorer,
        };
    }
}
