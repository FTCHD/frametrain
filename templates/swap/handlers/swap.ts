'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, PoolNetwork, PoolToken } from '..'
import PageView from '../views/Page'
import initial from './initial'
import { fetchQuote } from '../utils/0x'
import { FrameError } from '@/sdk/error'

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

    if (!(params && config.pool) || buttonIndex === 1) {
        return initial({ config })
    }

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    console.log('Swap handler >> params:', params)

    const order = await fetchQuote({
        buyToken: token1,
        sellToken: token0,
        amount: params.amount,
        network: config.pool.network,
    })

    console.log('Swap handler >> order:', order)

    if (!order) {
        throw new FrameError('Failed to fetch quote')
    }

    return {
        buttons: [],
        transaction: {
            chainId: `eip155:${config.pool.network.id}`,
            method: 'eth_sendTransaction',
            params: {
                abi: [],
                to: order.to,
                data: order.data,
                value: order.value,
            },
        },
    }
}
