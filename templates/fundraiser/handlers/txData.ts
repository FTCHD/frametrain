'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { getSessionById } from '@paywithglide/glide-js'
import type { Config } from '..'
import { getClient } from '../common/onchain'
import { getGlideConfig } from '../common/shared'

export default async function txData({
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: {
        sessionId: string
    }
}): Promise<BuildFrameData> {
    if (!config.address) {
        throw new FrameError('Fundraise address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraise token not found.')
    }

    const client = getClient(config.token.chain)

    const glideConfig = getGlideConfig(client.chain)

    const session = await getSessionById(glideConfig, params.sessionId)

    if (session.paymentStatus === 'paid') {
        throw new FrameError('Payment already made')
    }

    if (!session.unsignedTransaction) {
        throw new FrameError('Missing transaction')
    }

    return {
        transaction: {
            chainId: session.unsignedTransaction.chainId,
            method: 'eth_sendTransaction',
            params: {
                to: session.unsignedTransaction.to,
                value: session.unsignedTransaction.value,
                data: session.unsignedTransaction.input,
                abi: [],
            },
        },
    }
}
