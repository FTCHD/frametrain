'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import type { Config } from '..'
import { getAddressFromEns, getClient } from '../common/onchain'
import { formatSymbol, getGlideConfig } from '../common/shared'
import ConfirmationView from '../views/Confirmation'
import about from './about'

export default async function confirmation({
    config,
    body,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    if (!config.address) {
        throw new FrameError('Fundraiser address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraiser token not found.')
    }

    const buttonIndex = body.validatedData.tapped_button.index as number
    const amounts = config.enablePredefinedAmounts ? config.amounts : []
    const lastButtonIndex = amounts.length + 1
    const isCustomAmount = buttonIndex === lastButtonIndex
    const client = getClient(config.token.chain)
    const glideConfig = getGlideConfig(client.chain)

    if (buttonIndex === 1) {
        return about({ config, body, storage: undefined })
    }

    let amount = 0
    let address = config.address as `0x${string}`

    if (isCustomAmount) {
        // Handle custom amount
        const textInput = body.validatedData.input?.text

        if (!textInput) {
            throw new FrameError('A custom amount is required.')
        }

        if (isNaN(Number(textInput))) {
            throw new FrameError('Invalid custom amount.')
        }

        amount = Number.parseFloat(textInput)
    } else {
        // Handle predefined amounts
        amount = config.amounts[buttonIndex - 1]
    }

    const chain = Object.keys(chains).find((chain) => (chains as any)[chain].id === client.chain.id)
    if (!chain) {
        throw new FrameError('Chain not found for the given client chain ID.')
    }

    try {
        if (!config.address.startsWith('0x')) {
            address = await getAddressFromEns(address)
        }

        const paymentCurrencyOnChain = (currencies as any)[config.token.symbol.toLowerCase()].on(
            (chains as any)[chain]
        )

        const session = await createSession(glideConfig, {
            paymentAmount: amount,
            chainId: client.chain.id,
            paymentCurrency: paymentCurrencyOnChain,
            address,
        })

        return {
            buttons: [
                {
                    label: 'Back',
                },
                {
                    label: 'Confirm',
                    action: 'tx',
                    handler: 'txData',
                },
            ],
            fonts: roboto,
            component: ConfirmationView({
                config,
                amount: formatSymbol(amount, config.token.symbol),
            }),
            handler: 'status',
            params: { sessionId: session.sessionId },
        }
    } catch (e) {
        const error = e as Error
        throw new FrameError(error.message)
    }
}
