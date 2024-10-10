'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { getGlide } from '@/sdk/glide'
import { getSessionById } from '@paywithglide/glide-js'
import type { Config, Storage } from '..'

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
    if (!config.token || !config.amount) {
        throw new FrameError('Token or amount not specified in the bet configuration.')
    }

    const glide = getGlide(config.chain)

    const session = await getSessionById(glide, params.sessionId)

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
