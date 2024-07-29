'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import SuccessView from '../views/Success'
import { updatePaymentTransaction, waitForSession } from '@paywithglide/glide-js'
import { FrameError } from '@/sdk/error'
import { getClient } from '../utils/viem'
import { getGlideConfig } from '../utils/shared'
import RefreshView from '../views/Refresh'
import initial from './initial'

export default async function status({
    body,
    config,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: { transactionId?: string; sessionId?: string }
}): Promise<BuildFrameData> {
    if (!config.address) {
        throw new FrameError('Fundraiser address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraiser token not found.')
    }

    console.log('status handler >> tapped buttons:', body.validatedData.tapped_button)

    if (!body.validatedData.transaction && body.validatedData.tapped_button) {
        return initial({ config, body, storage: undefined })
    }

    console.log(`status handler >> tx info for sessionId: ${params.sessionId}`, {
        transaction: body.validatedData.transaction,
        params,
    })

    if (!(body.validatedData.transaction?.hash || params.transactionId)) {
        throw new FrameError('Transaction Hash is missing')
    }

    if (!params.sessionId) {
        throw new FrameError('Session Id is missing')
    }

    const txHash = (
        body.validatedData.transaction ? body.validatedData.transaction.hash : params.transactionId
    ) as `0x${string}`

    const client = getClient(config.token.chain)
    const glideConfig = getGlideConfig(client.chain)

    try {
        // Get the status of the payment transaction
        const updatedTx = await updatePaymentTransaction(glideConfig, {
            sessionId: params.sessionId,
            hash: txHash,
        })
        console.log('status handler >> updatedTx:', updatedTx)
        // Wait for the session to complete. It can take a few seconds
        const session = await waitForSession(glideConfig, params.sessionId)

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
                sessionId: params.sessionId,
                isFresh: false,
            },
        }
    }
}
