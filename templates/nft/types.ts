import type { BaseConfig, BaseStorage } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'

export interface NFT {
    contractAddress: string
    tokenId: string
    name: string
    description: string
    imageUrl: string
}

export interface Config extends BaseConfig {
    title: string
    description: string
    coverImage: string
    nfts: NFT[]
    gating: GatingType
}

export interface Storage extends BaseStorage {
    purchases: {
        buyer: string
        nft: NFT
        price: string
        timestamp: number
    }[]
}

export interface ReservoirOrderResponse {
    // Defina os campos relevantes da resposta da API do Reservoir
}
