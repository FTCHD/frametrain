'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { getGlide } from '@/sdk/glide'
import { chains, createSession, currencies } from '@paywithglide/glide-js'
import type { Config } from '..'
import { formatSymbol, getAddressFromEns } from '../common'
import ConfirmationView from '../views/Confirmation'
import about from './about'

export default async function confirmation({
    config,
    body,
}: {
    body: FramePayloadValidated
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const buttonIndex = body.tapped_button.index as number

    if (buttonIndex === 1) {
        return about({ config, body, storage: undefined })
    }

    if (!config.address) {
        throw new FrameError('Fundraiser address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraiser token not found.')
    }

    if (config.cover.title?.fontFamily) {
        fontSet.add(config.cover.title.fontFamily)
    }

    if (config.cover.subtitle?.fontFamily) {
        fontSet.add(config.cover.subtitle.fontFamily)
    }

    if (config.cover.bottomMessage?.fontFamily) {
        fontSet.add(config.cover.bottomMessage.fontFamily)
    }

    const amounts = config.enablePredefinedAmounts ? config.amounts : []
    const lastButtonIndex = amounts.length + 2
    const isCustomAmount = buttonIndex === lastButtonIndex
    const glide = getGlide(config.token.chain)

    let amount = 0
    let address = config.address as `0x${string}`

    if (isCustomAmount) {
        // Handle custom amount
        const textInput = body.input?.text

        if (!textInput) {
            throw new FrameError('A custom amount is required.')
        }

        if (isNaN(Number(textInput))) {
            throw new FrameError('Invalid custom amount.')
        }

        amount = Number.parseFloat(textInput)
    } else {
        // Handle predefined amounts
        amount = config.amounts[buttonIndex - 2]
    }

    const chain = Object.keys(chains).find(
        (chain) => (chains as any)[chain].id === glide.chains[0].id
    )

    if (!chain) {
        throw new FrameError('Chain not found for the given chain ID.')
    }

    try {
        if (!config.address.startsWith('0x')) {
            address = await getAddressFromEns(address)
        }

        const paymentCurrencyOnChain = (currencies as any)[config.token.symbol.toLowerCase()].on(
            (chains as any)[chain]
        )

        const session = await createSession(glide, {
            paymentAmount: amount,
            chainId: glide.chains[0].id,
            paymentCurrency: paymentCurrencyOnChain,
            address,
        })

        for (const font of fontSet) {
            const loadedFont = await loadGoogleFontAllVariants(font)
            fonts.push(...loadedFont)
        }

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
            fonts,
            component: ConfirmationView({
                config,
                amount: formatSymbol(amount, config.token.symbol),
            }),
            aspectRatio: '1.91:1',
            handler: 'status',
            params: { sessionId: session.sessionId, amount },
        }
    } catch (e) {
        console.error('Error creating session', e)
        throw new FrameError('Failed to create a donation session. Please try again')
    }
}
