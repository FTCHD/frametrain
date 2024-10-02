'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { encodeFunctionData } from 'viem'
import type { Config } from '..'
import { getSliceProductPaymentPayload } from '../common/slice'
import initial from './initial'

export default async function txData({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: {
        productId: string
    }
}): Promise<BuildFrameData> {
    if (!(body.address && params && config.storeAddress && config.storeInfo)) {
        return initial({ config })
    }

    const payload = await getSliceProductPaymentPayload(
        config.storeInfo.id,
        Number(params.productId),
        body.address as `0x${string}`
    )
    const data = encodeFunctionData(payload)

    return {
        transaction: {
            chainId: `eip155:${payload.chain.id}`,
            method: 'eth_sendTransaction',
            params: {
                to: payload.address,
                value: payload.value.toString(),
                data,
                abi: payload.abi,
            },
        },
    }
}
