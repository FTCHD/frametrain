'use server'

import {
    createClient,
    type paths,
    reservoirChains as reservoir0xChains,
} from '@reservoir0x/reservoir-sdk'
import { http, createPublicClient, parseAbi, createWalletClient, hexToBigInt } from 'viem'
import * as viemChains from 'viem/chains'
import type { Config } from '..'

export type ParsedToken = {
    namespace: string
    chainId: number
    address: string
    tokenId?: string // Optional
}

export type NftInfo = {
    contract: string
    tokenId: string
    chainId: number
    image: string
    collectionName: string
    kind?: string
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
    address,
    tokenId,
}: { address: string; tokenId: string }): Promise<NftInfo> {
    const req = await fetch(`https://api.reservoir.tools/tokens/v7?tokens=${address}:${tokenId}`)
    const res = await req.json()
    const data = res as paths['/tokens/v7']['get']['responses']['200']['schema']['tokens']
    console.log({ data })
    if (!data?.length || data[0]?.token) throw Error('Invalid NFT Metadata')
    if (!data[0]?.token) throw Error('Invalid NFT Metadata')
    const token = data[0].token

    return {
        contract: token.contract,
        tokenId: token.tokenId,
        chainId: token.chainId,
        image: token?.image || '',
        collectionName: token.collection?.name || 'Collection',
        kind: token.kind,
    }
}

export async function getNftOrders({
    contract,
    tokenId,
    maker,
}: { contract: string; tokenId: string; maker: string }) {
    const req = await fetch(
        `https://api.reservoir.tools/orders/asks/v5?contracts=${contract}:${tokenId}&maker=${maker}`
    )
    const res = await req.json()
    const data = res as paths['/orders/asks/v5']['get']['responses']['200']['schema']['orders']
    return data || []
}

export async function buyNft({
    nft,
    quantity,
    address,
}: { nft: Config['nfts'][number]; quantity: number; address: string }) {
    const reservoirChain = reservoirChains.find((chain) => chain.id === nft.chainId)
    const viemChain = Object.values(viemChains).find((chain) => chain.id === nft.chainId)

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
            contractAddress: nft.contract,
        }),
        supportsInterface({
            interfaceId: ERC1155_ERC165,
            viemChain,
            contractAddress: nft.contract,
        }),
    ])

    let buyTokenPartial: { token?: string; collection?: string }
    if (isERC721) {
        buyTokenPartial = { collection: nft.contract }
    } else if (isERC1155) {
        buyTokenPartial = { token: `${nft.contract}:${nft.tokenId}` }
    } else {
        buyTokenPartial = { collection: nft.contract }
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
