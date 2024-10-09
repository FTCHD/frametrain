'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import type { Config, Storage } from '../types'
import { createListing } from '../utils/reservoir'
import SellView from '../views/Sell'

export default async function sell({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    runGatingChecks(body, config.gating)

    const nftIndex = Number.parseInt(body.buttonIndex) - 1
    const nft = config.nfts[nftIndex]

    if (!nft) {
        throw new Error('Invalid NFT selection')
    }

    const listingData = await createListing(
        nft.contractAddress,
        nft.tokenId,
        body.untrustedData.fid
    )

    return {
        buttons: [
            { label: 'Confirm Listing', action: 'tx' },
            { label: 'Cancel', action: 'post' },
        ],
        image: nft.imageUrl,
        component: SellView(nft, listingData),
        handler: 'success',
    }
}
