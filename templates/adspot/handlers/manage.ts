'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '..'
import PageView from '../views/Page'
import buy from './buy'  

export default async function manage({
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
    const isBidder = storage.bids.some(bid => bid.bidder === body.fid.toString())

    if (isOwner) {
        if (body.buttonIndex === 1) {
            const allBidsComponent = {
                type: 'div',
                props: {
                    style: { fontFamily: 'Roboto', fontSize: '18px', padding: '20px' },
                    children: [
                        {
                            type: 'h1',
                            props: {
                                style: { fontSize: '24px', fontWeight: 'bold' },
                                children: 'All Bids'
                            }
                        },
                        ...storage.bids.map((bid, index) => ({
                            type: 'div',
                            props: {
                                key: index,
                                children: [
                                    { type: 'p', props: { children: `Bidder: ${bid.bidder}` } },
                                    { type: 'p', props: { children: `Amount: ${bid.amount}` } },
                                    { type: 'p', props: { children: `Time: ${new Date(bid.timestamp).toLocaleString()}` } },
                                    { type: 'hr' }
                                ]
                            }
                        }))
                    ]
                }
            }

            return {
                buttons: [{ label: 'Back', action: 'post' }],
                component: allBidsComponent,
                handler: 'manage',
            }
        } else if (body.buttonIndex === 2 && config.mode === 'Auction') {            
            const highestBid = storage.bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
            storage.currentAd = {
                winner: highestBid.bidder,
                visitLink: storage.currentAd.visitLink,
                expiryTime: Date.now() + (config.expiry * 60 * 60 * 1000),
            };

            return {
                buttons: [{ label: 'Back' }],
                component: {
                    type: 'div',
                    props: {
                        style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
                        children: [
                            { type: 'h1', props: { children: 'Bid Approved!' } },
                            { type: 'p', props: { children: `Winner: ${highestBid.bidder}` } },
                            { type: 'p', props: { children: `Amount: ${highestBid.amount}` } }
                        ]
                    }
                },
                handler: 'manage',
                storage,
                webhooks: [{ event: 'adChanged', data: storage.currentAd }],
            };
        } else if (body.buttonIndex === 2) {
            const bidderToAccept = body.inputText;
            const acceptedBid = storage.bids.find(bid => bid.bidder === bidderToAccept);

            if (acceptedBid) {
                storage.currentAd = {
                    winner: acceptedBid.bidder,
                    visitLink: storage.currentAd.visitLink,
                    expiryTime: Date.now() + (config.expiry * 60 * 60 * 1000),
                };

                return {
                    buttons: [{ label: 'Back' }],
                    component: {
                        type: 'div',
                        props: {
                            style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
                            children: [
                                { type: 'h1', props: { children: 'Bid Approved!' } },
                                { type: 'p', props: { children: `Winner: ${acceptedBid.bidder}` } },
                                { type: 'p', props: { children: `Amount: ${acceptedBid.amount}` } }
                            ]
                        }
                    },
                    handler: 'manage',
                    storage,
                    webhooks: [{ event: 'adChanged', data: storage.currentAd }],
                };
            } else {
                throw new Error('Invalid bidder');
            }
        }
    } else if (isWinner) {
        if (body.buttonIndex === 1) {
            storage.currentAd.visitLink = body.inputText
            const adUpdatedComponent = {
                type: 'div',
                props: {
                    style: { fontFamily: 'Roboto', fontSize: '24px', textAlign: 'center', padding: '20px' },
                    children: [
                        { type: 'h1', props: { children: 'Ad Updated!' } },
                        { type: 'p', props: { children: `Your new visit link: ${storage.currentAd.visitLink}` } }
                    ]
                }
            }

            return {
                buttons: [{ label: 'Back to Info' }],
                component: adUpdatedComponent,
                handler: 'page',
                storage,
                webhooks: [{ event: 'adChanged', data: storage.currentAd }],
            }
        }
    } else if (isBidder) {
        if (body.buttonIndex === 1) {
            return buy({ body, config, storage, params })
        }
    }
    
    return {
        buttons: [
            { label: 'Visit', action: 'link', target: storage.currentAd.visitLink || config.visitLink },
            { label: 'ℹ️', action: 'post' }
        ],
        component: PageView(config, storage, body.fid.toString()),
        handler: 'page',
    }
}