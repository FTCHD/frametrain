'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CounterpartyAcceptedView from '../views/counterpartyAccepted'

export default async function counterpartyAccepted({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config.fontFamily ?? 'Roboto')

    // Update storage to reflect that the bet has been accepted
    storage.betAccepted = true
    storage.counterpartyAddress = body.interactor.verified_accounts[0]

    return {
        buttons: [{ label: 'Back to Bet' }],
        fonts,
        component: CounterpartyAcceptedView(config, storage),
        handler: 'bet',
    }
}
