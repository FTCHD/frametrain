'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'
import initial from './initial'
import { getGlide } from '@/sdk/glide'
import { updatePaymentTransaction, waitForSession } from '@paywithglide/glide-js'

export default async function success({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: {
        amount: string
        transactionId?: string
        sessionId?: string
        retries?: string
    }
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const webhooks: NonNullable<BuildFrameData['webhooks']> = []
    const transactionHash = body.transaction
    const bids = storage.bids || []
    let newStorage = storage || {}

    if (!transactionHash) {
        throw new FrameError('Failed to fetch transaction hash')
    }

    const fontSet = new Set(['Inter'])
    const fonts: any[] = []

    if (!(config.token?.chain && config.token?.symbol)) {
        throw new FrameError('Bid token has not been set')
    }

    if (!config.payout) {
        throw new FrameError('Bid payout address has not been set')
    }

    if (!body.transaction && body.tapped_button) {
        return initial({ config, storage })
    }

    if (!(body.transaction?.hash || params.transactionId)) {
        throw new FrameError('Transaction Hash is missing')
    }

    if (!params.sessionId) {
        throw new FrameError('Session Id is missing')
    }

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    const txHash = (
        body.transaction ? body.transaction.hash : params.transactionId
    ) as `0x${string}`

    const glide = getGlide(config.token.chain)
    const retries =
        params.retries === undefined || isNaN(Number.parseInt(params.retries)) ? 0 : +params.retries
    const txUrl = `https://${glide.chains[0].blockExplorers?.default.url}/tx/${txHash}`

    const buildData: Record<string, unknown> = {
        fonts,
        webhooks,
        storage,
        handler: 'initial',
    }

    try {
        // Get the status of the payment transaction
        await updatePaymentTransaction(glide, {
            sessionId: params.sessionId,
            hash: txHash,
        })
        // Wait for the session to complete. It can take a few seconds
        await waitForSession(glide, params.sessionId)

        const bid = bids.find((b) => b.id === params.sessionId)
        if (bid && config.mode === 'continuous') {
            newStorage = {
                ...storage,
                winningBid: bid.id,
                // add tx value to bid
                bids: bids.map((b) => (b.id === bid.id ? { ...b, tx: txHash, ts: Date.now() } : b)),
            }
        }

        buildData['webhooks'] = [
            {
                event: 'adspot_payment_successful',
                data: {
                    fid: body.interactor.fid,
                    transaction_id: txHash,
                    transaction_chain: glide.chains[0].name,
                    transaction_url: txUrl,
                    bidAmount: params.amount,
                    bidToken: config.token.symbol,
                    bidMode: config.mode,
                    timestamp: Date.now(),
                },
            },
        ]

        buttons.push(
            {
                label: 'Bid again',
            },
            {
                label: 'View Transaction',
                action: 'link',
                target: txUrl,
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://www.frametra.in',
            }
        )

        if (config.success.image) {
            buildData.image = config.success.image
        } else {
            for (const font of fontSet) {
                const loadedFont = await loadGoogleFontAllVariants(font)
                fonts.push(...loadedFont)
            }
            buildData.component = BasicView(config.success)
        }

        buildData.buttons = buttons
        buildData.storage = newStorage
    } catch (e) {
        const error = e as Error
        // updatePaymentTransaction throws an error if the transaction is already paid
        const paid = error.message.toLowerCase().includes('session is already paid')

        buildData['handler'] = paid ? 'success' : 'status'
        const MAX_RETRIES = 3

        if (paid) {
            const bid = bids.find((b) => b.id === params.sessionId)
            if (bid && config.mode === 'continuous' && !storage.winningBid) {
                newStorage = {
                    ...storage,
                    winningBid: bid.id,
                    bids: bids.map((b) =>
                        b.id === bid.id
                            ? { ...b, tx: txHash, ts: b.ts < Date.now() ? b.ts : Date.now() }
                            : b
                    ),
                }
            }
            buttons.push(
                {
                    label: 'Donate again',
                },
                {
                    label: `View on ${glide.chains[0].blockExplorers?.default.name}`,
                    action: 'link',
                    target: `https://${glide.chains[0].blockExplorers?.default.url}/tx/${txHash}`,
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

            buildData['params'] = {
                ...params,
                retries: retries + 1,
            }
        }

        if (retries >= MAX_RETRIES) {
            buttons.length = 0
            buildData['handler'] = 'success'
            buildData['webhooks'] = [
                {
                    event: 'adspot_payment_failed',
                    data: {
                        fid: body.interactor.fid,
                        transaction_id: txHash,
                        transaction_chain: glide.chains[0].name,
                        transaction_url: txUrl,
                        amount: Number(params.amount),
                        token_symbol: config.token.symbol,
                        cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
                    },
                },
            ]
            buildData['component'] = BasicView({
                title: {
                    text: 'Failed to check transaction status',
                },
                subtitle: {
                    text: 'We were unable to verify the status of your transaction. Please try again.',
                },
                background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
            })

            buttons.push(
                {
                    label: 'Donate again',
                },
                {
                    label: `View on ${glide.chains[0].blockExplorers?.default.name}`,
                    action: 'link',
                    target: txUrl,
                },
                {
                    label: 'Create Your Own',
                    action: 'link',
                    target: 'https://www.frametra.in',
                }
            )
        } else {
            if (config.success?.image) {
                buildData['image'] = paid ? config.success?.image : undefined
            } else {
                buildData['component'] = paid
                    ? BasicView(config.success)
                    : BasicView({
                          title: {
                              text: 'Waiting for payment confirmation..',
                          },
                          subtitle: {
                              text: 'This may take a few seconds. Please tap on the Refresh button.',
                          },
                          background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
                      })
            }
        }

        buildData['buttons'] = buttons
    }

    return buildData as unknown as BuildFrameData
}
