'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import BetView from '../views/bet'

export default async function bet({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config.fontFamily ?? 'Roboto')
    const userFid = body.interactor.fid
    const userRole = getUserRole(userFid, config)

    if (body.tapped_button.index === 1) {
        return handleButtonPress(body, userRole, config, storage, fonts)
    }

    // Default view
    return {
        buttons: [{ label: 'Back' }],
        fonts,
        component: BetView(config, storage, userRole),
        handler: 'initial',
    }
}

function handleButtonPress(
    body: FramePayloadValidated,
    userRole: ReturnType<typeof getUserRole>,
    config: Config,
    storage: Storage,
    fonts: Awaited<ReturnType<typeof loadGoogleFontAllVariants>>
): BuildFrameData {
    switch (userRole) {
        case 'creator': {
            if (storage.winner) {
                return {
                    buttons: [
                        {
                            label: 'Pay',
                            action: 'tx',
                            target: 'https://frametrain-api.com/create-payment-transaction',
                        },
                        { label: 'Back' },
                    ],
                    fonts,
                    component: BetView(config, storage, userRole),
                    handler: 'bet',
                }
            }
            break
        }
        case 'counterparty': {
            if (!storage.betAccepted) {
                storage.betAccepted = true
                storage.counterpartyAddress = body.interactor.verified_accounts[0]
                return {
                    buttons: [{ label: 'Back' }],
                    fonts,
                    component: BetView(config, storage, userRole),
                    handler: 'counterpartyAccepted',
                }
            }
            break
        }
        case 'arbitrator': {
            if (storage.betAccepted && !storage.winner) {
                if (config.deadline && new Date() < config.deadline) {
                    throw new FrameError("Can't decide winner before the deadline")
                }
                return {
                    buttons: [
                        { label: 'Creator Wins' },
                        { label: 'Counterparty Wins' },
                        { label: 'Back' },
                    ],
                    fonts,
                    component: BetView(config, storage, userRole),
                    handler: 'arbitratorDecided',
                }
            }
            break
        }
        default:
            throw new FrameError('Unauthorized action')
    }

    // If no specific action was taken, return to default view
    return {
        buttons: [{ label: 'Back' }],
        fonts,
        component: BetView(config, storage, userRole),
        handler: 'initial',
    }
}

function getUserRole(
    userFid: number,
    config: Config
): 'creator' | 'counterparty' | 'arbitrator' | 'other' {
    if (userFid === config.fid) return 'creator'
    if (userFid === Number.parseInt(config.counterparty.replace('@', ''))) return 'counterparty'
    if (
        userFid === Number.parseInt(config.arbitrator.replace('@', '')) ||
        userFid === Number.parseInt(config.backupArbitrator.replace('@', ''))
    )
        return 'arbitrator'
    return 'other'
}
