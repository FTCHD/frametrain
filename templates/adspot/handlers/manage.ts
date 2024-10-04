'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import PageView from '../views/Page'
import { buy } from './buy'
import {
    createAllBidsComponent,
    handleAuctionEnd,
    handleBidAcceptance,
    handleAdUpdate,
} from './manageHelpers'

export async function manage({
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
    const isOwner = body.fid.toString() === config.owner
    const isWinner = body.fid.toString() === storage.currentAd.winner
    const isBidder = storage.bids.some((bid) => bid.bidder === body.fid.toString())

    if (isOwner) {
        return handleOwnerActions(body, config, storage)
    } else if (isWinner) {
        return handleWinnerActions(body, storage)
    } else if (isBidder) {
        return handleBidderActions(body, config, storage, params)
    }

    return {
        buttons: [
            { label: 'Visit', action: 'link', target: storage.currentAd.visitLink || config.visitLink },
            { label: 'ℹ️', action: 'post' },
        ],
        component: PageView(config, storage, body.fid.toString()),
        handler: 'page',
    }
}

function handleOwnerActions(body: FramePayloadValidated, config: Config, storage: Storage): BuildFrameData {
    if (body.buttonIndex === 1) {
        return {
            buttons: [{ label: 'Back', action: 'post' }],
            component: createAllBidsComponent(storage, config),
            handler: 'manage',
        }
    } else if (body.buttonIndex === 2 && config.mode === 'Auction') {
        return handleAuctionEnd(storage, config)
    } else if (body.buttonIndex === 2) {
        return handleBidAcceptance(storage, config, body.inputText)
    }
    throw new Error('Invalid action for owner')
}

function handleWinnerActions(body: FramePayloadValidated, storage: Storage): BuildFrameData {
    if (body.buttonIndex === 1) {
        return handleAdUpdate(storage, body.inputText)
    }
    throw new Error('Invalid action for winner')
}

function handleBidderActions(
    body: FramePayloadValidated,
    config: Config,
    storage: Storage,
    params: any
): BuildFrameData {
    if (body.buttonIndex === 1) {
        return buy({ body, config, storage, params })
    }
    throw new Error('Invalid action for bidder')
}