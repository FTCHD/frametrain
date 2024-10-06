'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { validateConfig } from '../utils/validateConfig'
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

    try {
        validateConfig(config);
    } catch (error) {
        throw new FrameError(error.message);
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