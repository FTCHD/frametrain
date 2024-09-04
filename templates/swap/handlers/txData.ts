'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import { fetchQuote } from '../common/0x'
import initial from './initial'

export default async function txData({
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    if (!(params && config.pool)) {
        return initial({ config })
    }

    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    try {
        const order = await fetchQuote({
            buyToken: token1,
            sellToken: token0,
            amount: params.buyAmount,
            network: config.pool.network,
        })

        if (!order) {
            throw new Error('Failed to fetch quote')
        }

        return {
            buttons: [],
            transaction: {
                chainId: `eip155:${config.pool.network.id}`,
                method: 'eth_sendTransaction',
                params: {
                    to: order.to,
                    value: order.value,
                    data: order.data,
                    abi: [],
                },
            },
        }
    } catch (e) {
        const error = e as Error
        throw new FrameError(error.message)
    }
}
