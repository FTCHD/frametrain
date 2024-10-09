'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ArbitratorDecidedView from '../views/arbitratorDecided'

export default async function arbitratorDecided({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    // Ensure only the arbitrator can make this decision
    if (body.interactor.fid !== config.arbitrator?.fid) {
        throw new FrameError('Only the arbitrator can decide the winner')
    }

    // Set the winner based on the button pressed
    if (body.tapped_button.index === 1) {
        storage.winner = 'owner'
    } else if (body.tapped_button.index === 2) {
        storage.winner = 'opponent'
    } else {
        throw new FrameError('Invalid button pressed')
    }

    return {
        buttons: [{ label: 'Back to Bet' }],
        fonts: roboto,
        component: ArbitratorDecidedView(config, storage),
        handler: 'bet',
    }
}
