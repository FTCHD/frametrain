'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'

import type { Config } from '..'
import BetView from '../views/Bet'

export default async function bet({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    // Validate config fields
    if (!config.claim) {
        throw new FrameError("No claim")
    }

    if (!config.owner) {
        throw new FrameError("No owner specified")
    }

    if (!config.opponent) {
        throw new FrameError("No opponent specified")
    }

    if (!config.arbitrator) {
        throw new FrameError("No arbitrator specified")
    }

    if (!config.asset) {
        throw new FrameError("No asset specified")
    }

    if (!config.amount) {
        throw new FrameError("No amount specified")
    }

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        aspectRatio: '1.91:1',
        component: BetView(config),
        handler: 'initial',
    }
}
