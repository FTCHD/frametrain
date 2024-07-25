'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { encodeFunctionData, erc20Abi, formatUnits, type Hex, parseEther } from 'viem'
import type { Config } from '..'
import { ZeroXProxyAddressByChainID } from '../utils/0x'
import { ERC20_ABI } from '../utils/abis'
import { getClientByChainId } from '../utils/viem'
import initial from './initial'
import { formatSymbol } from '../utils/shared'

export default async function approve({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
              sellAmount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const userAddress = body.validatedData.address as Hex

    if (!(params && config.pool)) {
        return initial({ config })
    }

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1

    try {
        const client = getClientByChainId(config.pool.network.id)

        const allowanceRaw = await client.readContract({
            address: token0.address,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [userAddress, ZeroXProxyAddressByChainID[config.pool.network.id]],
        })
        const allowance = formatUnits(allowanceRaw, token0.decimals)

        const approvalValue = parseEther(params.sellAmount)

        console.log('Approve handler >> allowance info:', {
            allowance: {
                number: Number(allowance),
                string: allowance,
                formatted: formatSymbol(allowance, token0.symbol),
            },
            sellAmount: {
                number: Number(params.sellAmount),
                string: params.sellAmount,
                formatted: formatSymbol(params.sellAmount, token0.symbol),
            },
            buyAmount: {
                number: Number(params.buyAmount),
                string: params.buyAmount,
                formatted: formatSymbol(params.buyAmount, token0.symbol),
            },
            params,
            approvalValue: approvalValue.toString(),
        })

        if (Number(allowance) >= Number(params.sellAmount)) {
            throw new FrameError('You can buy right away. Press Buy Now!')
        }

        const calldata = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [ZeroXProxyAddressByChainID[config.pool.network.id], approvalValue],
        })

        const transaction = {
            chainId: `eip155:${config.pool.network.id}`,
            method: 'eth_sendTransaction',
            attribution: false,
            params: {
                abi: erc20Abi,
                data: calldata,
                to: token0.address,
                value: BigInt(0).toString(),
            },
        } as BuildFrameData['transaction']

        return {
            buttons: [],
            transaction,
        }
    } catch (e) {
        const error = e as Error
        throw new FrameError(error.message)
    }
}
