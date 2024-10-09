'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    body,
    config,
    storage,
    params,
}: {
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    storage.opponentAccepted = false
    storage.winner = null
    storage.payToWinner = false
    storage.arbitrateTimestamp = BigInt(0)

    return {
        buttons: [
            {
                label: 'Bet',
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts: roboto,
        storage: storage,
        component: CoverView(config),
        handler: 'bet',
    }
}