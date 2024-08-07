import { http, type Chain, type Hex, createPublicClient, erc20Abi } from 'viem'
import { arbitrum, base, degen, gnosis, mainnet, optimism, zora } from 'viem/chains'

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
export const supportedChains: {
    key: 'mainnet' | 'base' | 'optimism' | 'zora' | 'arbitrum' | 'degen' | 'gnosis'
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
]

export type ChainKey = (typeof supportedChains)[number]['key']

export function getClient(chainKey: ChainKey) {
    const chainKeyToChain: Record<ChainKey, Chain> = {
        'base': base,
        'arbitrum': arbitrum,
        'degen': degen,
        'gnosis': gnosis,
        'optimism': optimism,
        'zora': zora,
        'mainnet': mainnet,
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

export async function getAddressFromEns(name: string) {
    const client = getClient('mainnet')

    const hex = await client.getEnsAddress({ name })
    if (!hex) {
        throw new Error('Invalid ENS name')
    }

    console.log(`address for ens ${name} is ${hex} on ${client.chain.name}`)

    return hex.toLowerCase() as `0x${string}`
}

export async function getTokenSymbol(address: Hex, chainKey: ChainKey) {
    const client = getClient(chainKey)

    try {
        const symbol = await client.readContract({
            abi: erc20Abi,
            functionName: 'symbol',
            address,
        })
        return symbol
    } catch (error) {
        console.error(`error at getTokenSymbol for address ${address} on ${chainKey}`, error)

        throw new Error('Not an ERC20 token')
    }
}
