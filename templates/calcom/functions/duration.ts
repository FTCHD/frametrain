'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Duration'
import NotSatisfied from '../views/NotSatisfied'

import { balances721, balancesERC1155 } from '../utils/balances'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function duration(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    let containsUserFID = true
    let nftGate = true

    if (
        config.gatingOptions.follower &&
        !body.validatedData.interactor.viewer_context.followed_by
    ) {
        return {
            buttons: [],
            fonts: roboto,

            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Only profile followed by the creator can schedule a call.'
            ),
            functionName: 'initial',
        }
    }

    if (config.gatingOptions.following && !body.validatedData.interactor.viewer_context.following) {
        return {
            buttons: [],
            fonts: roboto,

            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Please follow the creator to schedule the call.'
            ),
            functionName: 'initial',
        }
    }

    if (config.gatingOptions.recasted && !body.validatedData.cast.viewer_context.recasted) {
        return {
            buttons: [],
            fonts: roboto,

            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Please recast this frame and try again to schedule the call.'
            ),
            functionName: 'initial',
        }
    }

    if (config.gatingOptions.liked && !body.validatedData.cast.viewer_context.liked) {
        return {
            buttons: [],
            fonts: roboto,

            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Please like this frame and try again to schedule the call.'
            ),
            functionName: 'initial',
        }
    }

    if (config.gatingOptions.karmaGating) {
        const url = 'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000'
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${config.fid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            containsUserFID = data.result.some(
                (item: any) => item.fid === body.validatedData.interactor.fid
            )
        } catch (error) {
            console.log(error)
        }
    }
    if (config.gatingOptions.nftGating) {
        if (body.validatedData.interactor.verified_addresses.eth_addresses.length === 0) {
            return {
                buttons: [],
                fonts: roboto,

                component: NotSatisfied(
                    config,
                    'Please Connect wallet to your farcaster account and hold the NFT to schedule the call.'
                ),
                functionName: 'initial',
            }
        }
        if (config.nftOptions.nftType === 'ERC721') {
            nftGate = await balances721(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                config.nftOptions.nftAddress,
                config.nftOptions.nftChain
            )
        } else {
            nftGate = await balancesERC1155(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                config.nftOptions.nftAddress,
                config.nftOptions.tokenID,
                config.nftOptions.nftChain
            )
        }
    }

    if (!containsUserFID) {
        return {
            buttons: [],
            fonts: roboto,
            component: NotSatisfied(
                config,
                'You havent satisfied the requirements to meet the call. Only people within 2nd degree of connection can schedule the call.'
            ),
            functionName: 'initial',
        }
    }
    if (!nftGate) {
        return {
            buttons: [],
            fonts: roboto,
            component: NotSatisfied(
                config,
                `You havent satisfied the requirements to meet the call. You need to hold the NFT - ${config.nftOptions.nftName} to schedule the call.`
            ),
            functionName: 'initial',
        }
    }
    return {
        buttons: [
            {
                label: '15min',
            },
            {
                label: '30min',
            },
        ],
        fonts: roboto,

        component: PageView(config),
        functionName: 'date',
    }
}
