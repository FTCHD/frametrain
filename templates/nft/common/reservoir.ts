'use server'

import { createClient, reservoirChains as reservoir0xChains } from '@reservoir0x/reservoir-sdk'
import { http, createPublicClient, parseAbi, createWalletClient, hexToBigInt } from 'viem'
import * as viemChains from 'viem/chains'
import type { Config } from '..'

export type ParsedToken = {
    namespace: string
    chainId: number
    address: string
    tokenId?: string // Optional
}

const reservoirChains = [...Object.values(reservoir0xChains)]

/** Parses a [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) compliant URL with optional token ID */
export function getTokenFromUrl(url: string): ParsedToken {
    // Split the URL by ':' to get the parts
    const [namespace, chainId, address, tokenId] = url.split(':')

    if (!(namespace && chainId && address)) {
        throw new Error('Invalid token URL')
    }

    return {
        namespace,
        chainId: Number.parseInt(chainId),
        address,
        tokenId: tokenId || undefined,
    }
}

export const reservoir = createClient({
    chains: reservoirChains.map((chain) => ({ ...chain, active: true })),
    source: 'frametra.in',
    apiKey: process.env.RESERVOIR_API_KEY,
})

const ERC1155_ERC165 = '0xd9b67a26'
const ERC721_ERC165 = '0x80ac58cd'

export async function supportsInterface({
    interfaceId,
    viemChain,
    contractAddress,
}: { interfaceId: `0x${string}`; viemChain: viemChains.Chain; contractAddress: string }) {
    const publicClient = createPublicClient({
        chain: viemChain,
        transport: http(),
    })
    return publicClient
        .readContract({
            address: contractAddress as `0x${string}`,
            abi: parseAbi([
                'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
            ]),
            functionName: 'supportsInterface',
            args: [interfaceId],
        })
        .catch((err) => {
            console.error(err)
            return false
        })
}

export async function getNftInfo({
    chainId,
    contractAddress,
    tokenId,
}: { chainId: number; contractAddress: string; tokenId?: string }) {
    try {
        const reservoirChain = reservoirChains.find((chain) => chain.id === chainId)
        const viemChain = Object.values(viemChains).find((chain) => chain.id === chainId)

        if (!(reservoirChain && viemChain)) {
            throw new Error('Unsupported chain')
        }

        const publicClient = createPublicClient({
            chain: viemChain,
            transport: http(),
        })

        const [isERC721, isERC1155] = await Promise.all([
            supportsInterface({ interfaceId: ERC721_ERC165, viemChain, contractAddress }),
            supportsInterface({ interfaceId: ERC1155_ERC165, viemChain, contractAddress }),
        ])

        await reservoir.actions
    } catch (e) {
        console.error(`error at getNftInfo for address ${contractAddress} on ${chainId}`, e)

        throw e
    }
}

export async function getNftMetadata({
    chainId,
    contractAddress,
    tokenId,
}: { chainId: number; contractAddress: string; tokenId?: string }) {
    // TODO: implement
}

export async function buyNft({
    nft,
    quantity,
    address,
}: { nft: Config['nfts'][number]; quantity: number; address: string }) {
    const reservoirChain = reservoirChains.find((chain) => chain.id === nft.token.chainId)
    const viemChain = Object.values(viemChains).find((chain) => chain.id === nft.token.chainId)

    if (!(reservoirChain && viemChain)) {
        throw new Error('Unsupported chain')
    }

    const wallet = createWalletClient({
        account: address as `0x${string}`,
        transport: http(),
        chain: viemChain,
    })

    const [isERC721, isERC1155] = await Promise.all([
        supportsInterface({
            interfaceId: ERC721_ERC165,
            viemChain,
            contractAddress: nft.token.contract,
        }),
        supportsInterface({
            interfaceId: ERC1155_ERC165,
            viemChain,
            contractAddress: nft.token.contract,
        }),
    ])

    let buyTokenPartial: { token?: string; collection?: string }
    if (isERC721) {
        buyTokenPartial = { collection: nft.token.contract }
    } else if (isERC1155) {
        buyTokenPartial = { token: `${nft.token.contract}:${nft.token.tokenId}` }
    } else {
        buyTokenPartial = { collection: nft.token.contract }
    }

    const res = await reservoir.actions.buyToken({
        items: [{ ...buyTokenPartial, quantity, fillType: 'mint' }],
        wallet,
        precheck: true,
        // biome-ignore lint/complexity/noVoid: <explanation>
        onProgress: () => void 0,
    })

    if (res === true) {
        return 'Something went wrong'
    }

    const mintTx = res.steps?.find((step) => step?.id === 'sale')

    if (!mintTx) {
        return 'Something went wrong'
    }

    const items = mintTx.items
    if (!items || items.length === 0) {
        return 'Something went wrong'
    }

    return {
        chainId: `eip155:${viemChain.id}`,
        method: 'eth_sendTransaction',
        params: {
            ...items[0].data,
            value: hexToBigInt(items[0].data.value || 0).toString(),
        },
    }
}
