'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
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
        await updatePaymentTransaction(glideConfig, {
            sessionId: params.sessionId,
            hash: txHash,
        })
        // Wait for the session to complete. It can take a few seconds
        const session = await waitForSession(glideConfig, params.sessionId)

        console.log('status handler >> Session:', session)

        return {
            buttons: [
                {
                    label: `View on ${client.chain.blockExplorers?.default.name}`,
                    action: 'link',
                    target: `https://${client.chain.blockExplorers?.default.url}/tx/${txHash}`,
                },
                {
                    label: 'Create Your Own',
                    action: 'link',
                    target: 'https://www.frametra.in',
                },
            ],
            component: config.success?.image ? undefined : SuccessView(config),
            handler: 'success',
            image: config.success?.image,
        }
    } catch (e) {
        const buttons: FrameButtonMetadata[] = []
        const error = e as Error
        // updatePaymentTransaction throws an error if the transaction is already paid
        const paid = error.message.toLowerCase().includes('session is already paid')

        if (paid) {
            buttons.push(
                {
                    label: 'Donate again',
                },
                {
                    label: `View on ${client.chain.blockExplorers?.default.name}`,
                    action: 'link',
                    target: `https://${client.chain.blockExplorers?.default.url}/tx/${txHash}`,
                },
                {
                    label: 'Create Your Own',
                    action: 'link',
                    target: 'https://www.frametra.in',
                }
            )
        } else {
            buttons.push({
                label: 'Refresh',
            })
        }

        return {
            buttons,
            image: paid ? config.success?.image : undefined,
            component: paid ? undefined : RefreshView(),
            handler: paid ? 'success' : 'status',
            params: {
                transactionId: txHash,
                sessionId: params.sessionId,
            },
        }
    }
}
