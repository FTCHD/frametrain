import type { Config, Storage } from '..'

export function createHeaderComponent(config: Config, storage: Storage) {
    return {
        type: 'div',
        props: {
            children: [
                {
                    type: 'h1',
                    props: {
                        style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' },
                        children: 'Ad Space Details',
                    },
                },
                createAdDetailsComponent(config, storage),
            ],
        },
    }
}

export function createAdDetailsComponent(config: Config, storage: Storage) {
    return {
        type: 'div',
        props: {
            style: { marginBottom: '15px' },
            children: [
                { type: 'p', props: { children: `Mode: ${config.mode}` } },
                { type: 'p', props: { children: `Current Highest Bid: ${storage.highestBid} ${config.currency}` } },
                config.mode === 'Auction' && {
                    type: 'p',
                    props: { children: `Auction Deadline: ${formatDate(config.deadline)}` },
                },
                config.mode === 'Continuous' && {
                    type: 'p',
                    props: { children: `Ad Expiry: ${formatDate(storage.currentAd.expiryTime)}` },
                },
            ].filter(Boolean),
        },
    }
}

export function createOwnerDashboardComponent(storage: Storage) {
    return {
        type: 'div',
        props: {
            style: { marginBottom: '15px' },
            children: [
                {
                    type: 'h2',
                    props: {
                        style: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' },
                        children: 'Owner Dashboard',
                    },
                },
                { type: 'p', props: { children: `Total Bids: ${storage.bids.length}` } },
                {
                    type: 'p',
                    props: {
                        children: `Highest Bidder: ${storage.bids[storage.bids.length - 1]?.bidder || 'No bids yet'
                            }`,
                    },
                },
            ],
        },
    }
}

export function createWinnerCornerComponent(storage: Storage, config: Config) {
    return {
        type: 'div',
        props: {
            style: { marginBottom: '15px' },
            children: [
                {
                    type: 'h2',
                    props: {
                        style: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' },
                        children: "Winner's Corner",
                    },
                },
                { type: 'p', props: { children: 'Congratulations! You are the current ad space winner.' } },
                { type: 'p', props: { children: `Your Winning Bid: ${storage.highestBid} ${config.currency}` } },
            ],
        },
    }
}

export function createBidderStatusComponent(currentBid: number, storage: Storage, config: Config) {
    return {
        type: 'div',
        props: {
            style: { marginBottom: '15px' },
            children: [
                {
                    type: 'h2',
                    props: {
                        style: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' },
                        children: 'Your Bid Status',
                    },
                },
                { type: 'p', props: { children: `Your Current Bid: ${currentBid} ${config.currency}` } },
                { type: 'p', props: { children: `Highest Bid: ${storage.highestBid} ${config.currency}` } },
                storage.highestBid > currentBid && {
                    type: 'p',
                    props: {
                        style: { color: 'red' },
                        children: 'Your bid has been outbid. Consider placing a higher bid!',
                    },
                },
            ].filter(Boolean),
        },
    }
}

export function createPlaceBidComponent(storage: Storage, config: Config) {
    return {
        type: 'div',
        props: {
            style: { marginBottom: '15px' },
            children: [
                {
                    type: 'h2',
                    props: {
                        style: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' },
                        children: 'Place Your Bid',
                    },
                },
                {
                    type: 'p',
                    props: { children: 'Enter your bid amount to participate in this ad space auction.' },
                },
                {
                    type: 'p',
                    props: { children: `Current Highest Bid: ${storage.highestBid} ${config.currency}` },
                },
            ],
        },
    }
}

export function createFooterComponent(config: Config, storage: Storage) {
    return {
        type: 'div',
        props: {
            style: { fontSize: '14px', color: 'gray' },
            children: [
                { type: 'p', props: { children: `Ad Space ID: ${config.id}` } },
                {
                    type: 'p',
                    props: {
                        children: `Total Participants: ${new Set(storage.bids.map((bid) => bid.bidder)).size
                            }`,
                    },
                },
            ],
        },
    }
}

function formatDate(date: number | undefined) {
    return date ? new Date(date).toLocaleString() : 'Not set'
}