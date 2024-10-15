import { getViem } from '@/sdk/viem'
import type { Address, Chain } from 'viem'

import { decodeFunctionData, encodeFunctionData, erc20Abi } from 'viem'
import type { airdropChains } from '../index'

export type Configuration = {
    operatorPrivateKey: string
    chain: keyof typeof airdropChains
    paymentAmount: number
    receiverAddress: string
    tokenAddress: string
    walletAddress: string
}

export const farcasterSupportedChains = [
    'mainnet',
    'base',
    'arbitrum',
    'optimism',
    'polygon',
] as const

export const chainKeyToChain = farcasterSupportedChains.reduce((acc, chain) => {
    //@ts-expect-error
    acc[chain] = getViem(chain).chain
    return acc
}, {}) as Record<(typeof farcasterSupportedChains)[number], Chain>

export function convertTransferToTransferFrom(
    unsignedTransaction: { chainId: string; input: Address; to: string; value: bigint },
    payerAddress: string
) {
    const decoded = decodeFunctionData({
        abi: erc20Abi,
        data: unsignedTransaction.input,
    })

    const transferFromData = {
        functionName: 'transferFrom',
        args: [payerAddress, decoded.args[0] as `0x${string}`, decoded.args[1] as bigint],
        abi: erc20Abi,
    } as const

    // Encode the function data
    //@ts-expect-error:
    const data = encodeFunctionData(transferFromData)
    return {
        to: unsignedTransaction.to as Address,
        data,
    }
}

export function getDetailsFromPaymentCurrency(caip19: string) {
    // Split the CAIP19 string by "/"
    const parts = caip19.split('/')

    if (parts.length < 2) {
        return { chainId: null, hexAddress: null }
    }

    // Extract the chainId from the "eip155:{chainId}" part
    const chainPart = parts[0].split(':')
    let chainId = null

    if (chainPart.length === 2 && chainPart[0] === 'eip155') {
        chainId = Number(chainPart[1])
        if (isNaN(chainId)) {
            chainId = null
        }
    }

    // Check the second part (slip44 or erc20)
    const typePart = parts[1].split(':')
    let hexAddress = null

    if (typePart.length === 2) {
        if (typePart[0] === 'erc20') {
            // It's an ERC20 token, extract the Hex address
            hexAddress = typePart[1] // This should be the hex address part
        }
        // If it's "slip44", hexAddress remains null
    }

    return { chainId, hexAddress }
}
