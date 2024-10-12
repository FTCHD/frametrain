'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ArbitratorDecidedView from '../views/ArbitratorDecided'

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
    let newStorage = storage

    // Ensure only the arbitrator can make this decision
    if (body.interactor.fid !== config.arbitrator?.fid) {
        throw new FrameError('Only the arbitrator can decide the winner')
    }

    // If the deadline is in the past, throw an error
    if (config.deadline * 1000 < Date.now()) {
        throw new FrameError('Deadline is in the past')
    }

    // Set the winner based on the button pressed
    if (body.tapped_button.index === 1) {
        newStorage = Object.assign(storage, {
            winner: 'owner',
        })
    } else if (body.tapped_button.index === 2) {
        newStorage = Object.assign(storage, {
            winner: 'opponent',
        })
    } else {
        throw new FrameError('Invalid button pressed')
    }

    newStorage = Object.assign(storage, {
        arbitrateTimestamp: Date.now(),
    })

    return {
        buttons: [{ label: 'Back to Bet' }],
        fonts: roboto,
        storage: newStorage,
        component: ArbitratorDecidedView(config, newStorage),
        handler: 'bet',
    }
}
