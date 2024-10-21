'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { supportedChains } from '@/sdk/viem'
import ms from 'ms'
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
    const buttonIndex = body.tapped_button.index
    const bids = storage.bids || []
    try {
        const chain = supportedChains.find((chain) => chain.key === config.token!.chain)

        if (
            !(
                chain &&
                config.owner &&
                config.token?.chain &&
                config.token?.symbol &&
                config.address
            )
        ) {
            throw new FrameError('Frame not fully configured')
        }

        if (params.bid !== 'true') {
            if (buttonIndex === 1) {
                return initial({ config, storage })
            }

            if (buttonIndex === 3) {
                return manage({ body, config, storage })
            }
        }

        const highestBid =
            config.mode === 'auction' && bids.length
                ? bids.reduce((max, bid) => (max.amount > bid.amount ? max : bid))
                : storage.winningBid
                  ? bids.find((bid) => bid.id === storage.winningBid)
                  : null

        const hasExpired = Boolean(
            config.mode === 'auction'
                ? Date.now() > new Date(config.deadline).getTime()
                : highestBid &&
                      Date.now() > new Date(Number(highestBid.ts)).getTime() + ms(config.deadline)
        )

        const fonts = await loadGoogleFontAllVariants('Nunito Sans')

        return {
            buttons: [
                {
                    label: hasExpired ? 'Back' : 'Bid',
                },
            ],
            component: BuyView({
                config,
                highestBid: highestBid || null,
                chain: chain.label,
                hasExpired,
            }),
            handler: 'bid',
            inputText: hasExpired ? undefined : 'Amount to bid',
            storage,
            fonts,
            params: {
                hasExpired,
            },
        }
    } catch (e) {
        const error = e as Error
        console.error(e)
        throw new Error(error.message)
    }
}
