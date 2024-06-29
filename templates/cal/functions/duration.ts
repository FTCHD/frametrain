'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import { balances721, balancesERC1155 } from '../utils/balances'
import PageView from '../views/Duration'
import NotSatisfied from '../views/NotSatisfied'

export default async function duration(
    body: FrameActionPayloadValidated,
    config: Config,
    state: State,
    params: any
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
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,

            component: NotSatisfied(
                config,
                'You have not satisfied the requirements. Only profiles followed by the creator can schedule a call.'
            ),
            functionName: 'errors',
        }
    }

    if (config.gatingOptions.following && !body.validatedData.interactor.viewer_context.following) {
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,

            component: NotSatisfied(
                config,
                'You have not satisfied the requirements. Please follow the creator and try again.'
            ),
            functionName: 'errors',
        }
    }

    if (config.gatingOptions.recasted && !body.validatedData.cast.viewer_context.recasted) {
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,
            component: NotSatisfied(
                config,
                'You have not satisfied the requirements. Please recast this frame and try again.'
            ),
            functionName: 'errors',
        }
    }

    if (config.gatingOptions.liked && !body.validatedData.cast.viewer_context.liked) {
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,

            component: NotSatisfied(
                config,
                'You have not satisfied the requirements. Please like this frame and try again.'
            ),
            functionName: 'errors',
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
                buttons: [
                    {
                        label: 'back',
                    },
                ],
                fonts: fonts,

                component: NotSatisfied(
                    config,
                    'Please connect a wallet to your profile that holds the NFT required to schedule a call.'
                ),
                functionName: 'errors',
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
                config.nftOptions.tokenId,
                config.nftOptions.nftChain
            )
        }
    }

    if (!containsUserFID) {
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,
            component: NotSatisfied(
                config,
                'You have not satisfied the requirements. Only people within 2nd degree of connection can schedule a call.'
            ),
            functionName: 'errors',
        }
    }

    if (!nftGate) {
        return {
            buttons: [
                {
                    label: 'back',
                },
            ],
            fonts: fonts,
            component: NotSatisfied(
                config,
                `You have not satisfied the requirements. You need to hold ${config.nftOptions.nftName} to schedule a call.`
            ),
            functionName: 'errors',
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
        fonts: fonts,

        component: PageView(config),
        functionName: 'date',
    }
}
