'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { getGlide } from '@/sdk/glide'
import { getSessionById } from '@paywithglide/glide-js'
import type { Config } from '..'

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
    if (!config.payout?.address) {
        throw new FrameError('Frame not properly configured. Payout amount is missing')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Ad placement token not found.')
    }

    const glide = getGlide(config.token.chain)

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
