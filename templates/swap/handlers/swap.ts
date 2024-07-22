'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { erc20Abi, formatUnits, type Hex } from 'viem'
import type { Config } from '..'
import { fetchQuote, ZeroXProxyAddressByChainID } from '../utils/0x'
import { getClientByChainId } from '../utils/viem'
import initial from './initial'
import { formatSymbol } from '../utils/shared'

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
              sellAmount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const userAddress = body.validatedData.address as Hex

    if (!(params && config.pool)) {
        return initial({ config })
    }

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    const client = getClientByChainId(config.pool.network.id)

    const allowance = await client.readContract({
        address: token0.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, ZeroXProxyAddressByChainID[config.pool.network.id]],
    })

    console.log(
        'Swap handler >> allowance info:',
        formatSymbol(formatUnits(allowance, token0.decimals), token0.symbol)
    )
    console.log('Swap handler >> sellAmount:', formatSymbol(params.sellAmount, token0.symbol))

    if (Number(allowance) < Number(params.sellAmount)) {
        throw new FrameError('Requires approval!')
    }

    const order = await fetchQuote({
        buyToken: token1,
        sellToken: token0,
        amount: params.sellAmount,
        network: config.pool.network,
    })

    if (!order) {
        throw new FrameError('Failed to fetch quote')
    }

    console.log('Swap handler >> order:', order)

    const transaction = {
        chainId: `eip155:${config.pool.network.id}`,
        method: 'eth_sendTransaction',
        params: {
            to: order.to,
            value: order.value,
            data: order.data,
            abi: [],
        },
    } as BuildFrameData['transaction']

    return {
        buttons: [],
        transaction,
    }
}
