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
    let newStorage = { ...storage }
    newStorage.opponentAccepted = true

    newStorage = Object.assign(storage, newStorage)
    return {
        buttons: [{ label: 'Back' }],
        fonts: roboto,
        storage: newStorage,
        component: CounterpartyAcceptedView(config, newStorage.opponentAccepted),
        handler: 'bet',
    }
}
