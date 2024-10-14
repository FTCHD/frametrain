'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import type { Config, Storage } from '..'
import PayView from '../views/Pay'

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

    if (!storage.winner) {
        throw new FrameError('No winner has been decided yet.')
    }

    if (!config.token || !config.amount) {
        throw new FrameError('Token or amount not specified in the bet configuration.')
    }

    const winnerAddress =
        storage.winner == 'owner'
            ? config.owner?.wallet_address
            : config.opponent?.wallet_address

    if (!winnerAddress) {
        throw new FrameError('Winner address not found.')
    }

    const glide = getGlide(config.chain)

    try {
        const chain = Object.keys(chains).find((chain) => (chains as any)[chain].id === glide.chains[0].id)

        if (!chain) {
            throw new FrameError('Unsupported chain')
        }

        const paymentCurrencyOnChain = (currencies as any)[config.token.name.toLowerCase()].on(
            (chains as any)[chain]
        )

        const session = await createSession(glide, {
            paymentAmount: config.amount * 2, // Double the bet amount
            chainId: glide.chains[0].id,
            paymentCurrency: paymentCurrencyOnChain,
            address: winnerAddress,
        })

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
            storage: storage,
            component: PayView(config, storage),
            handler: 'bet',
            params: { sessionId: session.sessionId },
        }
    } catch (e) {
        console.error('Error creating payment session', e)
        throw new FrameError('Failed to create a payment session. Please try again')
    }
}
