'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import type { Config, Storage } from '..'
import PayView from '../views/Pay'
import { supportedChains } from '@/sdk/viem'

export default async function pay({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    let newStorage = { ...storage }

    if (!newStorage.winner) {
        throw new FrameError('No winner has been decided yet.')
    }

    if (!config.token || !config.amount) {
        throw new FrameError('Token or amount not specified in the bet configuration.')
    }

    const winnerAddress =
        newStorage.winner === 'owner'
            ? config.owner?.custody_address
            : config.opponent?.custody_address

    if (!winnerAddress) {
        throw new FrameError('Winner address not found.')
    }

    const glide = getGlide(config.chain)

    try {
        const chainId = supportedChains.find((chain) => chain.key === config.chain)?.id

        if (!chainId) {
            throw new FrameError('Unsupported chain')
        }

        const paymentCurrencyOnChain = (currencies as any)[config.token.name.toLowerCase()].on(
            (chains as any)[chainId]
        )

        const session = await createSession(glide, {
            paymentAmount: config.amount * 2, // Double the bet amount
            chainId: chainId,
            paymentCurrency: paymentCurrencyOnChain,
            address: winnerAddress,
        })

        newStorage = Object.assign(storage, newStorage)
        return {
            buttons: [
                { label: 'Back' },
                {
                    label: 'Pay',
                    action: 'tx',
                    handler: 'txData',
                },
            ],
            fonts: roboto,
            storage: newStorage,
            component: PayView(config, newStorage),
            handler: 'bet',
            params: { sessionId: session.sessionId },
        }
    } catch (e) {
        console.error('Error creating payment session', e)
        throw new FrameError('Failed to create a payment session. Please try again')
    }
}
