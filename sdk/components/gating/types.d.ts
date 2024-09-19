import type { ChainKey } from '@/sdk/viem'

export type GatingErcType = {
    network: ChainKey
    address: string
    symbol: string
    balance: number
    tokenId?: number | undefined
}

export type GatingRequirementsType = {
    channels?: string[] | undefined
    minFid?: number | undefined
    maxFid?: number | undefined
    exactFids?: number[] | undefined
    score?: { score: number; owner: number } | undefined
    erc20?: GatingErcType[] | undefined
    erc721?: GatingErcType[] | undefined
    erc1155?: GatingErcType[] | undefined
    moxie?: { symbol: string; balance: number; address: string }[] | undefined
}

export type GatingType = {
    enabled: string[]
    requirements: GatingRequirementsType
}
