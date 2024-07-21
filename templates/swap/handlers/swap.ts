'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { encodeFunctionData, erc20Abi, formatUnits, type Hex, parseUnits } from 'viem'
import type { Config } from '..'
import { fetchQuote, ZeroXProxyAddressByChainID } from '../utils/0x'
import { ERC20_ABI } from '../utils/abis'
import { getClientByChainId } from '../utils/viem'
import initial from './initial'

export default async function swap({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params:
        | {
              amount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const buttonIndex = body.validatedData.tapped_button.index
    const userAddress = body.validatedData.address as Hex

    if (!(params && config.pool) || buttonIndex === 1) {
        return initial({ config })
    }

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0
    const nonETH = token0.symbol !== 'ETH'

    const getApprovalOrQuote = async (pool: typeof config.pool) => {
        let txData: NonNullable<BuildFrameData['transaction']>['params'] | null = null
        // 1. Request for approval
        // 2. Fetch quote
        // only request for approval if the token is not ETH
        // if the token is ETH or the user has already approved the token, fetch quote
        if (!nonETH) {
            const client = getClientByChainId(pool.network.id)

            const allowance = await client.readContract({
                address: token0.address,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [userAddress, ZeroXProxyAddressByChainID[pool.network.id]],
            })

            console.log('Swap handler >> allowance info:', formatUnits(allowance, token0.decimals))

            if (Number(allowance) < Number(params.amount)) {
                const approvalData = encodeFunctionData({
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [
                        ZeroXProxyAddressByChainID[pool.network.id],
                        parseUnits(params.amount, token0.decimals),
                    ],
                })
                console.log('Swap handler >> approval info:', approvalData)
                txData = {
                    abi: erc20Abi,
                    data: approvalData,
                    to: token0.address,
                    value: '0',
                }
            }
        }

        if (!txData) {
            const order = await fetchQuote({
                buyToken: token1,
                sellToken: token0,
                amount: params.amount,
                network: pool.network,
            })

            console.log('Swap handler >> order:', order)

            if (!order) {
                return null
            }

            txData = {
                to: order.to,
                value: order.value,
                data: order.data,
                abi: [],
            }
        }

        return txData
    }

    const txData = await getApprovalOrQuote(config.pool)

    if (!txData) {
        throw new FrameError('Failed to fetch quote')
    }

    const transaction = {
        chainId: `eip155:${config.pool.network.id}`,
        method: 'eth_sendTransaction',
        params: txData,
    } as BuildFrameData['transaction']

    console.log('Swap handler >> transaction:', transaction)

    return {
        buttons: [],
        transaction,
    }
}
