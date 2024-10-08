'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { supportedChains } from '@/sdk/viem'
import type { Config, Storage } from '..'
import BuyView from '../views/Buy'
import initial from './initial'
import manage from './manage'

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
    const fonts = await loadGoogleFontAllVariants('Nunito Sans')
    const buttonIndex = body.tapped_button.index
    const bids = storage.bids || []

    if (!(config.fid && config.token?.chain && config.token?.symbol && config.address)) {
        throw new FrameError('Frame not fully configured')
    }

    const highestBig =
        config.mode === 'auction' && storage.currentBid
            ? bids.find((bid) => bid.id === storage.currentBid)
            : null
    const winningBid =
        config.mode === 'continuous' && storage.winningBid
            ? bids.find((bid) => bid.id === storage.winningBid)
            : null
    const chain = supportedChains.filter((chain) => chain.key === config.token!.chain)

    if (params.bid !== 'true') {
        if (buttonIndex === 1) {
            return initial({ config, storage })
        }

        if (buttonIndex === 3) {
            return manage({ body, config, storage })
        }
    }

    return {
        buttons: [
            {
                label: 'Bid',
            },
        ],
        component: BuyView(config, highestBig || winningBid || null, chain[0].label),
        handler: 'bid',
        inputText: 'Amount to bid',
        storage,
        fonts,
    }
}
