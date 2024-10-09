'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { validateConfig } from '../utils/validateConfig'
import { getRoleByFid } from '../utils/role'
import type { Config, Storage } from '..'
import BetView from '../views/Bet'

export default async function bet({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    try {
        validateConfig(config)
    } catch (error) {
        throw new FrameError(error.message)
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const interactorFid = config.arbitrator?.fid ?? 0
    const interactorRole = getRoleByFid(config, interactorFid)

    if (storage.opponentAccepted == null) {
        storage.opponentAccepted = false
    }

    if (body.tapped_button.index === 1) {
        if (interactorRole === 'owner') {
            // handle owner case when there is a winner
            if (storage.winner) {
                // Implement logic for owner to pay the winner
                storage.payToWinner = true
            }
        } else if (interactorRole === 'opponent') {
            if (!storage.opponentAccepted) {
                return {
                    buttons: [{ label: 'Accept the bet' }],
                    storage: storage,
                    component: BetView(
                        config,
                        storage.winner ?? null,
                        storage.opponentAccepted,
                        interactorRole
                    ),
                    handler: 'counterpartyAccepted',
                }
            }
        } else if (interactorRole === 'arbitrator') {
            if (storage.opponentAccepted && !storage.winner) {
                return {
                    buttons: [
                        { label: 'Back' },
                        { label: `Owner Wins` },
                        { label: `Opponent Wins` },
                    ],
                    storage: storage,
                    component: BetView(
                        config,
                        storage.winner ?? null,
                        storage.opponentAccepted,
                        interactorRole
                    ),
                    handler: 'arbitratorDecided',
                }
            }
        }
    }

    return {
        buttons: [
            { label: 'Back' },
            { label: `Accepted: ${storage.opponentAccepted}` },
            { label: `Winner: ${storage.winner ?? 'Not decided'}` },
        ],
        fonts: roboto,
        storage: storage,
        aspectRatio: '1.91:1',
        component: BetView(
            config,
            storage.winner ?? null,
            storage.opponentAccepted,
            interactorRole
        ),
        handler: 'initial',
    }
}
