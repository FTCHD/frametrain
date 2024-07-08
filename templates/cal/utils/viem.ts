import { http, createPublicClient } from 'viem'
import { base, mainnet, optimism } from 'viem/chains'

export const client = createPublicClient({
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