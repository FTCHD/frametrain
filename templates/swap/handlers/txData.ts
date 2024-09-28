'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'
import { fetchQuote } from '../common/0x'
import initial from './initial'
import { formatUnits } from 'viem'

export default async function txData({
    config,
    params,
    storage,
    body,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
              ts: string
          }
        | undefined
}): Promise<BuildFrameData> {
    if (!(params && config.pool)) {
        return initial({ config })
    }

    const fid = body.interactor.fid

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

        const swapData = storage.swapData[fid] || []
        swapData.push({
            amount: [
                Number(order.buyAmount),
                +formatUnits(BigInt(order.sellAmount), token0.decimals),
            ],
            ts: Number(params.ts),
        })

        const newStorage = {
            ...storage,
            swapData: {
                ...storage.swapData,
                [fid]: swapData,
            },
        }

        return {
            buttons: [],
            storage: newStorage,
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
