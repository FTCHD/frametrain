'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import PageView from '../views/Page'
import { renderToString } from 'react-dom/server'

export default async function buy({
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
    if (body.buttonIndex === 1) {
        return {
            buttons: [
                { label: 'Visit', action: 'link', target: storage.currentAd.visitLink || config.visitLink },
                { label: 'ℹ️', action: 'post' }
            ],
            component: PageView(config, storage, body.fid.toString()),
            handler: 'page',
        }
    }

    if (body.buttonIndex === 2) {
        const bidAmount = parseFloat(body.inputText)
        if (isNaN(bidAmount) || bidAmount <= storage.highestBid) {
            throw new Error('Invalid bid amount')
        }

        const newBid = {
            bidder: body.fid.toString(),
            amount: bidAmount,
            timestamp: Date.now(),
        }

        storage.bids.push(newBid)
        storage.highestBid = bidAmount

        if (config.mode === 'Continuous') {
            storage.currentAd = {
                winner: body.fid.toString(),
                expiryTime: Date.now() + (config.expiry * 60 * 60 * 1000),
                visitLink: storage.currentAd.visitLink,
            }
        }

        const successComponent = {
            type: 'div',
            props: {
                style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
                children: [
                    { type: 'h1', props: { children: 'Bid Successful!' } },
                    { type: 'p', props: { children: `Your bid of ${bidAmount} has been placed.` } }
                ]
            }
        }

        return {
            buttons: [{ label: 'Back to Info' }],
            component: successComponent,
            handler: 'page',
            storage,
            webhooks: [{ event: 'bid', data: newBid }],
        }
    }

    throw new Error('Invalid button index')
}