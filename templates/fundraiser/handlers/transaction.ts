'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import { FrameError } from '@/sdk/error'
import { getGlideConfig } from '../utils/shared'

import { getSessionById } from '@paywithglide/glide-js'
import { getClient } from '../utils/viem'

export default async function transaction({
    config,
    params,
}: {
    body: FrameValidatedActionPayload
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
        throw new FrameError('missing unsigned transaction')
    }

    return {
        buttons: [],
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
