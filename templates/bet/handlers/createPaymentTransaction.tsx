'use server'
import type { FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { encodeFunctionData, parseUnits } from 'viem'
import type { Config, Storage } from '..'

const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
    ETH: '0x0000000000000000000000000000000000000000',
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    // Add more tokens here as needed
}

const ERC20_ABI = [
    {
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

export default async function createPaymentTransaction({
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<any> {
    if (!(storage.winner && storage.counterpartyAddress)) {
        throw new FrameError('No winner decided or counterparty address not set')
    }

    const recipientAddress =
        storage.winner === 'counterparty' ? storage.counterpartyAddress : config.fid
    let to: `0x${string}`
    let value: string
    let data: `0x${string}`

    if (config.currency === 'ETH') {
        to = recipientAddress as `0x${string}`
        value = parseUnits(config.amount.toString(), 18).toString()
        data = '0x'
    } else if (TOKEN_ADDRESSES[config.currency]) {
        to = TOKEN_ADDRESSES[config.currency]
        value = '0'
        const decimals = config.currency === 'USDC' || config.currency === 'USDT' ? 6 : 18
        data = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [
                recipientAddress as `0x${string}`,
                parseUnits(config.amount.toString(), decimals),
            ],
        })
    } else {
        throw new FrameError('Unsupported currency')
    }

    return {
        chainId: 'eip155:10',
        method: 'eth_sendTransaction',
        params: {
            abi: config.currency === 'ETH' ? [] : ERC20_ABI,
            to,
            value,
            data,
        },
    }
}
