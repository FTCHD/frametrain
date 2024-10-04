import type { BuildFrameData } from '@/lib/farcaster'
import type { Config, Storage } from '..'

export function createAllBidsComponent(storage: Storage, config: Config) {
    return {
        type: 'div',
        props: {
            style: { fontFamily: 'Roboto', fontSize: '18px', padding: '20px' },
            children: [
                {
                    type: 'h1',
                    props: {
                        style: { fontSize: '24px', fontWeight: 'bold' },
                        children: 'All Bids',
                    },
                },
                ...storage.bids.map((bid, index) => ({
                    type: 'div',
                    props: {
                        key: index,
                        children: [
                            { type: 'p', props: { children: `Bidder: ${bid.bidder}` } },
                            { type: 'p', props: { children: `Amount: ${bid.amount} ${config.currency}` } },
                            { type: 'p', props: { children: `Time: ${new Date(bid.timestamp).toLocaleString()}` } },
                            { type: 'hr' },
                        ],
                    },
                })),
            ],
        },
    }
}

export function handleAuctionEnd(storage: Storage, config: Config): BuildFrameData {
    const highestBid = storage.bids.reduce((prev, current) =>
        prev.amount > current.amount ? prev : current
    )
    storage.currentAd = {
        winner: highestBid.bidder,
        visitLink: storage.currentAd.visitLink,
        expiryTime: Date.now() + config.expiry * 60 * 60 * 1000,
    }

    return {
        buttons: [{ label: 'Back' }],
        component: createBidApprovedComponent(highestBid, config),
        handler: 'manage',
        storage,
        webhooks: [{ event: 'adChanged', data: storage.currentAd }],
    }
}

export function handleBidAcceptance(storage: Storage, config: Config, bidderToAccept: string): BuildFrameData {
    const acceptedBid = storage.bids.find((bid) => bid.bidder === bidderToAccept)

    if (!acceptedBid) {
        throw new Error('Invalid bidder')
    }

    storage.currentAd = {
        winner: acceptedBid.bidder,
        visitLink: storage.currentAd.visitLink,
        expiryTime: Date.now() + config.expiry * 60 * 60 * 1000,
    }

    return {
        buttons: [{ label: 'Back' }],
        component: createBidApprovedComponent(acceptedBid, config),
        handler: 'manage',
        storage,
        webhooks: [{ event: 'adChanged', data: storage.currentAd }],
    }
}

export function handleAdUpdate(storage: Storage, newVisitLink: string): BuildFrameData {
    storage.currentAd.visitLink = newVisitLink
    const adUpdatedComponent = {
        type: 'div',
        props: {
            style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
            children: [
                { type: 'h1', props: { children: 'Ad Updated!' } },
                { type: 'p', props: { children: `Your new visit link: ${storage.currentAd.visitLink}` } },
            ],
        },
    }

    return {
        buttons: [{ label: 'Back to Info' }],
        component: adUpdatedComponent,
        handler: 'page',
        storage,
        webhooks: [{ event: 'adChanged', data: storage.currentAd }],
    }
}

function createBidApprovedComponent(bid: { bidder: string; amount: number }, config: Config) {
    return {
        type: 'div',
        props: {
            style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
            children: [
                { type: 'h1', props: { children: 'Bid Approved!' } },
                { type: 'p', props: { children: `Winner: ${bid.bidder}` } },
                { type: 'p', props: { children: `Amount: ${bid.amount} ${config.currency}` } },
            ],
        },
    }
}