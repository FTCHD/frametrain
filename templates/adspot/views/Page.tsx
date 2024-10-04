import type { Config, Storage } from '..'
import {
    createHeaderComponent,
    createOwnerDashboardComponent,
    createWinnerCornerComponent,
    createBidderStatusComponent,
    createPlaceBidComponent,
    createFooterComponent,
} from '../views/components'

export default function PageView(config: Config, storage: Storage, viewerFid: string) {
    const isOwner = viewerFid === config.owner
    const isWinner = viewerFid === storage.currentAd.winner
    const isBidder = storage.bids.some((bid) => bid.bidder === viewerFid)
    const currentBid = storage.bids.find((bid) => bid.bidder === viewerFid)?.amount || 0

    return {
        type: 'div',
        props: {
            style: {
                width: '100%',
                height: '100%',
                backgroundColor: config.cover.backgroundColor,
                color: config.cover.textColor,
                fontFamily: 'Roboto, sans-serif',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            children: [
                createHeaderComponent(config, storage),
                isOwner && createOwnerDashboardComponent(storage),
                isWinner && createWinnerCornerComponent(storage, config),
                isBidder && !isWinner && createBidderStatusComponent(currentBid, storage, config),
                !isOwner && !isWinner && !isBidder && createPlaceBidComponent(storage, config),
                createFooterComponent(config, storage),
            ].filter(Boolean),
        },
    }
}
