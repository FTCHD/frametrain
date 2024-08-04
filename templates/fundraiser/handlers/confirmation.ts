'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { formatSymbol, getGlideConfig } from '../utils/shared'
import { FrameError } from '@/sdk/error'
import { getAddressFromEns, getClient } from '../utils/viem'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import ConfirmationView from '../views/Confirmation'

export default async function confirmation({
    config,
    body,
}: {
    // GET requests don't have a body.
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

    if (!config.address.startsWith('0x')) {
        address = await getAddressFromEns(address)
    }

    const client = getClient(config.token.chain)
    const glideConfig = getGlideConfig(client.chain)

    const chain =
        Object.keys(chains).find((chain) => (chains as any)[chain].id === client.chain.id) || 'base'

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
                target: '/transaction',
            },
        ],
        fonts: roboto,
        component: ConfirmationView({ config, amount: formatSymbol(amount, config.token.symbol) }),
        handler: 'status',
        params: { sessionId: session.sessionId },
    }
}
