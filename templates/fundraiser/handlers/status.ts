'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import BasicView from '@/sdk/views/BasicView'
import { updatePaymentTransaction, waitForSession } from '@paywithglide/glide-js'
import type { Config } from '..'
import { formatSymbol } from '../common'
import RefreshView from '../views/Refresh'
import initial from './initial'

export default async function status({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { transactionId?: string; sessionId?: string; retries?: string; amount: string }
}): Promise<BuildFrameData> {
    if (!config.address) {
        throw new FrameError('Fundraiser address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraiser token not found.')
    }

    if (!body.transaction && body.tapped_button) {
        return initial({ config })
    }

    if (!(body.transaction?.hash || params.transactionId)) {
        throw new FrameError('Transaction Hash is missing')
    }

    if (!params.sessionId) {
        throw new FrameError('Session Id is missing')
    }

    if (isNaN(Number(params.amount))) {
        throw new FrameError('Invalid amount provided.')
    }

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    const txHash = (
        body.transaction ? body.transaction.hash : params.transactionId
    ) as `0x${string}`

    const glide = getGlide(config.token.chain)
    const retries =
        params.retries === undefined || isNaN(Number.parseInt(params.retries)) ? 0 : +params.retries
    const txUrl = `https://${glide.chains[0].blockExplorers?.default.url}/tx/${txHash}`

    try {
        // Get the status of the payment transaction
        await updatePaymentTransaction(glide, {
            sessionId: params.sessionId,
            hash: txHash,
        })
        // Wait for the session to complete. It can take a few seconds
        await waitForSession(glide, params.sessionId)

        const buildData: Record<string, any> = {
            fonts,
            buttons: [
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
                },
            ],
            handler: 'success',
        }

        if (config.success?.image) {
            buildData['image'] = config.success?.image
        } else {
            buildData['component'] = BasicView(config.success)
        }

        const amountInTokenCopy = `amount_in_${config.token.symbol.toLowerCase()}`

        buildData['webhooks'] = [
            {
                event: 'fundraiser.success',
                data: {
                    fid: body.interactor.fid,
                    transaction_id: txHash,
                    transaction_chain: glide.chains[0].name,
                    transaction_url: txUrl,
                    [`${amountInTokenCopy}`]: Number(params.amount),
                    [`${amountInTokenCopy}_formatted`]: formatSymbol(
                        params.amount,
                        config.token.symbol
                    ),
                    token_symbol: config.token.symbol,
                    token_decimals: glide.chains[0].nativeCurrency.decimals,
                    cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
                },
            },
        ]

        return buildData as BuildFrameData
    } catch (e) {
        const buttons: FrameButtonMetadata[] = []
        const error = e as Error
        // updatePaymentTransaction throws an error if the transaction is already paid
        const paid = error.message.toLowerCase().includes('session is already paid')
        const buildData: Record<string, any> = {
            handler: paid ? 'success' : 'status',
            params: {
                transactionId: txHash,
                sessionId: params.sessionId,
            },
            fonts,
            aspectRatio: '1.91:1',
        }
        const MAX_RETRIES = 3

        if (paid) {
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

            buildData['params'].retries = Math.min(retries + 1, MAX_RETRIES)
        }

        if (MAX_RETRIES) {
            buttons.length = 0
            buildData['handler'] = 'success'
            buildData['webhooks'] = [
                {
                    event: 'fundraiser.failed',
                    data: {
                        fid: body.interactor.fid,
                        transaction_id: txHash,
                        transaction_chain: glide.chains[0].name,
                        transaction_url: txUrl,
                        amount: Number(params.amount),
                        amount_formatted: formatSymbol(params.amount, config.token.symbol),
                        token_symbol: config.token.symbol,
                        cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
                    },
                },
            ]
            buildData['component'] = RefreshView(true)

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
                buildData['component'] = paid ? BasicView(config.success) : RefreshView()
            }
        }

        buildData['buttons'] = buttons

        return buildData as BuildFrameData
    }
}
