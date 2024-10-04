'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import PageView from '../views/Page'

function checkAndResetExpiration(config: Config, storage: Storage) {
    if (
        config.mode === 'Continuous' &&
        storage.currentAd.expiryTime &&
        Date.now() > storage.currentAd.expiryTime
    ) {
        storage.currentAd = {
            visitLink: config.visitLink,
            winner: undefined,
            expiryTime: undefined,
        }
        storage.highestBid = 0
        storage.bids = []
        return true
    }
    return false
}

export default async function page({
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
    const expired = checkAndResetExpiration(config, storage)
    const isOwner = body.fid.toString() === config.owner
    const isWinner = body.fid.toString() === storage.currentAd.winner
    const isBidder = storage.bids.some((bid) => bid.bidder === body.fid.toString())

    const buttons = [{ label: '←' }, { label: 'Buy Space' }]

    if (isOwner || isWinner || isBidder) {
        buttons.push({ label: 'Manage' })
    }

    const pageComponent = PageView(config, storage, body.fid.toString())

    if (typeof pageComponent !== 'object' || pageComponent === null) {
        throw new Error('PageView deve retornar um objeto válido')
    }

    return {
        buttons,
        component: pageComponent,
        handler: 'buy',
        storage: expired ? storage : undefined,
        webhooks: expired ? [{ event: 'adExpired', data: {} }] : undefined,
    }
}
