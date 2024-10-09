'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import type { Config, Storage } from '../types'
import { buyTokens } from '../utils/reservoir'
import BuyView from '../views/Buy'

export default async function buy({
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

    const buyData = await buyTokens(nft.contractAddress, nft.tokenId, body.untrustedData.fid)

    return {
        buttons: [
            { label: 'Confirm Purchase', action: 'tx' },
            { label: 'Buy with ETH', action: 'tx' },
            { label: 'Buy with USDC', action: 'tx' },
            { label: 'Cancel', action: 'post' },
        ],
        image: nft.imageUrl,
        component: BuyView(nft, buyData),
        handler: 'success',
    }
}
