import { http, createPublicClient } from 'viem'
import { base, mainnet, optimism, zora, blast, arbitrum, fantom, polygon } from 'viem/chains'

export const ethClient = createPublicClient({
    chain: mainnet,
    transport: http(),
})

export const baseClient = createPublicClient({
    chain: base,
    transport: http(),
})

export const opClient = createPublicClient({
    chain: optimism,
    transport: http(),
})

export const zoraClient = createPublicClient({
    chain: zora,
    transport: http(),
})

export const blastClient = createPublicClient({
    chain: blast,
    transport: http(),
})

export const arbitrumClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
})

export const fantomClient = createPublicClient({
    chain: fantom,
    transport: http(),
})

export const polygonClient = createPublicClient({
    chain: polygon,
    transport: http(),
})
