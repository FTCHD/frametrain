'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchUser } from '../utils'
import ManageBidderView from '../views/ManageBidder'
import ManageOwnerView from '../views/ManageOwner'
import ManageWinnerView from '../views/ManageWinner'

export default async function manage({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants('Nunito Sans')

    const fid = body.interactor.fid === 0 ? 260812 : body.interactor.fid
    const bids = storage.bids || []
    const buttons: FrameButtonMetadata[] = []
    const highestBig =
        config.mode === 'auction' && storage.currentBid
            ? storage.bids.find((bid) => bid.id === storage.currentBid)
            : null
    const winningBid =
        config.mode === 'continuous' && storage.winningBid
            ? bids.find((bid) => bid.id === storage.winningBid)
            : null
    const isOwner = config.fid === fid
    const isWinner =
        config.mode === 'auction'
            ? bids.some((bid) => bid.fid === fid && bid.approved)
            : winningBid?.fid === fid

    const buildData: BuildFrameData = {
        buttons,
        fonts,
        storage,
        handler: 'ad',
        params: {
            role: isOwner ? 'owner' : isWinner ? 'winner' : 'bidder',
        },
    }
    const WinnerBid = bids.find((bid) => bid.fid === fid && bid.approved)

    if (isOwner) {
        const url = new URL(body.url)
        const paths = url.pathname.split('/')
        url.pathname = paths.slice(0, paths.length - 1).join('/') + '/show'
        buttons.push(
            {
                label: 'Back',
            },
            {
                label: 'Check bids',
                action: 'link',
                target: `${url.origin}${url.pathname.replace('/p/', '/f/')}`,
            }
        )
        const user = highestBig ? await fetchUser(highestBig.fid) : undefined
        // count all bidded amount
        const total = bids.reduce((sum, bid) => sum + bid.amount, 0)
        buildData['component'] = ManageOwnerView({ config, total, user })
    } else if (isWinner) {
        if (WinnerBid) {
        }
        buildData['component'] = ManageWinnerView({ config, ad: storage.ad })
    } else {
        buildData['component'] = ManageBidderView(config)
    }

    buildData['buttons'] = buttons

    return buildData
}
