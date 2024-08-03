'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import { FrameError } from '@/sdk/error'
import { getGlideConfig } from '../utils/shared'

import { getSessionById } from '@paywithglide/glide-js'
import { getClient } from '../utils/viem'

export default async function page({
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

    const { unsignedTransaction } = await getSessionById(glideConfig, params.sessionId)

    if (!unsignedTransaction) {
        throw new FrameError('missing unsigned transaction')
    }

    return {
        buttons: [],
        transaction: {
            chainId: unsignedTransaction.chainId,
            method: 'eth_sendTransaction',
            params: {
                to: unsignedTransaction.to,
                value: unsignedTransaction.value,
                data: unsignedTransaction.input,
                abi: [],
            },
        },
    }
}
