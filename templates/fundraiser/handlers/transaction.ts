'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config } from '..'
import { FrameError } from '@/sdk/error'
import { getGlideConfig } from '../utils/shared'

import { currencies, createSession, chains } from '@paywithglide/glide-js'
import { getAddressFromEns, getClient } from '../utils/viem'

export default async function page({
    body,
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    if (!config.address) {
        throw new FrameError('Fundraise address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraise token not found.')
    }

    const account = body.validatedData.address

    const buttonIndex = body.validatedData.tapped_button.index as number
    const amounts = config.enablePredefinedAmounts ? config.amounts : []
    const lastButtonIndex = amounts.length + 1
    console.log(`page handlers >> opts 0x${'string'}`, {
        buttonIndex,
        amounts: {
            length: amounts.length,
            amounts,
        },
        lastButtonIndex,
    })

    let address = config.address as `0x${string}`
    let amount = 0
    const client = getClient(config.token.chain)
    const isCustomAmount = buttonIndex === lastButtonIndex

    console.log(`Sender Address: ${account}`)

    if (isCustomAmount) {
        // Handle custom amount
        const textInput = body.validatedData.input?.text
        console.log({ textInput })

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
        console.log(`Predinefined amount selected: ${amount}`)
    }

    if (!config.address.startsWith('0x')) {
        address = await getAddressFromEns(config.address)
    }

    console.log(`Receiver address: ${address}`)

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
        account,
    })

    console.log(`session created with id ${session.sessionId}`, session)

    if (!session.unsignedTransaction) {
        throw new FrameError('missing unsigned transaction')
    }

    return {
        buttons,
        params: { sessionId: session.sessionId },
        transaction: {
            chainId: session.unsignedTransaction.chainId,
            method: 'eth_sendTransaction',
            params: {
                to: session.unsignedTransaction.to,
                value: session.unsignedTransaction.value,
                data: session.unsignedTransaction.input,
                abi: [],
            },
        },
    }
}
