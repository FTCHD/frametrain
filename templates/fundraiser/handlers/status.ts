'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import SuccessView from '../views/Success'
import { getSessionByPaymentTransaction, waitForSession } from '@paywithglide/glide-js'
import { FrameError } from '@/sdk/error'
import { getClient } from '../utils/viem'
import { getGlideConfig } from '../utils/shared'
import { bytesToHex } from 'viem'
import RefreshView from '../views/Refresh'

export default async function status({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { transactionId?: string }
}): Promise<BuildFrameData> {
    if (!config.address) {
        throw new FrameError('Fundraise address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraise token not found.')
    }

    const txHash = body.validatedData.transaction
        ? body.validatedData.transaction.hash
        : params.transactionId

    console.log(`status handler >> txHash: ${txHash}`, {
        transaction: body.validatedData.transaction,
    })

    if (!txHash) {
        throw new FrameError('Transaction Hash is missing')
    }

    const client = getClient(config.token.chain)
    const glideConfig = getGlideConfig(client.chain)

    try {
        let session = await getSessionByPaymentTransaction(glideConfig, {
            chainId: client.chain.id,
            hash: txHash as `0x${string}`,
        })
        // Wait for the session to complete. It can take a few seconds
        session = await waitForSession(glideConfig, session.sessionId)

        console.log('status handler >> Session:', session)

        return {
            buttons: [
                {
                    label: 'Back',
                },
                {
                    label: 'Create Your Own',
                    action: 'link',
                    target: 'https://www.frametra.in',
                },
            ],
            component: SuccessView(config),
            handler: 'success',
        }
    } catch (error) {
        console.error('Error fetching session', error)

        return {
            buttons: [
                {
                    label: 'Refresh',
                },
            ],
            component: RefreshView(),
            handler: 'status',
            params: {
                transactionId: txHash,
            },
        }
    }
}
