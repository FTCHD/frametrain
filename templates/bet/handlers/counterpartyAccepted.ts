'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CounterpartyAcceptedView from '../views/CounterpartyAccepted'

export default async function counterpartyAccepted({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    storage.opponentAccepted = true

    return {
        buttons: [{ label: 'Back' }],
        fonts: roboto,
        storage: storage,
        component: CounterpartyAcceptedView(config, storage.opponentAccepted),
        handler: 'bet',
    }
}
