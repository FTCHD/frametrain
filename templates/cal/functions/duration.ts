'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import { balances721, balancesERC1155 } from '../utils/balances'
import PageView from '../views/Duration'
import { FrameError } from '@/sdk/handlers'

export default async function duration(
    body: FrameActionPayloadValidated,
    config: Config,
    _state: State,
    _params: any
): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.fontFamily)
        fonts.push(...titleFont)
    }

    let containsUserFID = true
    let nftGate = true

    if (
        config.gatingOptions.follower &&
        !body.validatedData.interactor.viewer_context.followed_by
    ) {
        throw new FrameError('Only profiles followed by the creator can schedule a call.')
    }

    if (config.gatingOptions.following && !body.validatedData.interactor.viewer_context.following) {
        throw new FrameError('Please follow the creator and try again.')
    }

    if (config.gatingOptions.recasted && !body.validatedData.cast.viewer_context.recasted) {
        throw new FrameError('Please recast this frame and try again.')
    }

    if (config.gatingOptions.liked && !body.validatedData.cast.viewer_context.liked) {
        throw new FrameError('Please like this frame and try again.')
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
            throw new FrameError('You do not have a wallet that holds the required NFT.')
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
                config.nftOptions.tokenId,
                config.nftOptions.nftChain
            )
        }
    }

    if (!containsUserFID) {
        throw new FrameError('Only people within 2nd degree of connection can schedule a call.')
    }

    if (!nftGate) {
        throw new FrameError(`You need to hold ${config.nftOptions.nftName} to schedule a call.`)
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
        fonts: fonts,

        component: PageView(config),
        functionName: 'date',
    }
}
