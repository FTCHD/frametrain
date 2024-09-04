export type GatingErcType = {
    network: string
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
}

export type GatingType = {
    enabled: string[]
    requirements: GatingRequirementsType
}