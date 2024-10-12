'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { validateConfig } from '../utils/validateConfig'
import { getRoleByFid } from '../utils/role'
import type { Config, Storage } from '..'
import BetView from '../views/Bet'
import PayView from '../views/Pay'

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

    const interactorFid = body.interactor.fid
    const interactorRole = getRoleByFid(config, interactorFid)

    let newStorage = { ...storage }

    if (body.tapped_button.index === 1) {
        if (interactorRole === 'owner') {
            // handle owner case when there is a winner
            if (newStorage.winner == 'opponent') {
                newStorage = Object.assign(storage, newStorage)
                return {
                    buttons: [{ label: `Pay to ${newStorage.winner}` }],
                    storage: newStorage,
                    component: PayView(config, newStorage),
                    handler: 'pay',
                }
            }
        } else if (interactorRole === 'opponent') {
            if (!newStorage.opponentAccepted) {
                newStorage = Object.assign(storage, newStorage)
                return {
                    buttons: [{ label: 'Accept the bet' }],
                    storage: newStorage,
                    component: BetView(
                        config,
                        newStorage.winner ?? null,
                        newStorage.opponentAccepted,
                        interactorRole
                    ),
                    handler: 'counterpartyAccepted',
                }
            }
            if (newStorage.opponentAccepted && newStorage.winner) {
                newStorage = Object.assign(storage, newStorage)
                return {
                    buttons: [{ label: `Pay to ${newStorage.winner}` }],
                    storage: newStorage,
                    component: PayView(config, newStorage),
                    handler: 'pay',
                }
            }
        } else if (interactorRole === 'arbitrator') {
            if (newStorage.opponentAccepted && !newStorage.winner) {
                newStorage = Object.assign(storage, newStorage)
                return {
                    buttons: [
                        { label: 'Back' },
                        { label: `Owner Wins` },
                        { label: `Opponent Wins` },
                    ],
                    storage: newStorage,
                    component: BetView(
                        config,
                        newStorage.winner ?? null,
                        newStorage.opponentAccepted,
                        interactorRole
                    ),
                    handler: 'arbitratorDecided',
                }
            }
        }
    }

    newStorage = Object.assign(storage, newStorage)
    return {
        buttons: [
            { label: 'Back' },
            { label: `Accepted: ${newStorage.opponentAccepted}` },
            { label: `Winner: ${newStorage.winner ?? 'Not decided'}` },
        ],
        fonts: roboto,
        storage: newStorage,
        aspectRatio: '1.91:1',
        component: BetView(
            config,
            newStorage.winner ?? null,
            newStorage.opponentAccepted,
            interactorRole
        ),
        handler: 'initial',
    }
}
