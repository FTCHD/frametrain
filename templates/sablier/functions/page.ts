'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import { getLogoForToken, getStreamData, getStreamHistory } from '../utils/actions'
import HistoryView from '../views/History'
import TokenView from '../views/Token'
import initial from './initial'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const buttonIndex = body.untrustedData.buttonIndex

    switch (buttonIndex) {
        case 2: {
            const urbanist = await loadGoogleFontAllVariants('Urbanist')
            const catamaran = await loadGoogleFontAllVariants('Catamaran')

            const streamData = await getStreamData(config.streamId)

            const tokenLogo = await getLogoForToken(streamData.chainId, streamData.asset.address)

            const data = Object.assign(
                {},
                streamData,
                { shape: config.shape },
                { asset: { ...streamData.asset, logo: tokenLogo } }
            )

            return {
                buttons: [
                    {
                        label: 'Summary',
                    },
                    {
                        label: 'Token',
                    },
                    {
                        label: 'History',
                    },
                    {
                        label: 'Create',
                        action: 'link',
                        target: 'https://app.sablier.com/gallery/group',
                    },
                ],
                aspectRatio: '1.91:1',
                fonts: [...urbanist, ...catamaran],
                component: TokenView(data),
                functionName: 'page',
            }
        }

        case 3: {
            const urbanist = await loadGoogleFontAllVariants('Urbanist')
            const catamaran = await loadGoogleFontAllVariants('Catamaran')

            const streamData = await getStreamData(config.streamId)
            const history = await getStreamHistory(config.streamId)

            const tokenLogo = await getLogoForToken(streamData.chainId, streamData.asset.address)

            return {
                buttons: [
                    {
                        label: 'Summary',
                    },
                    {
                        label: 'Token',
                    },
                    {
                        label: 'History',
                    },
                    {
                        label: 'Create',
                        action: 'link',
                        target: 'https://app.sablier.com/gallery/group',
                    },
                ],
                aspectRatio: '1.91:1',
                fonts: [...urbanist, ...catamaran],
                component: HistoryView(
                    {
                        ...streamData,
                        asset: { ...streamData.asset, logo: tokenLogo },
                    },
                    history
                ),
                functionName: 'page',
            }
        }

        default: {
            return initial(config, state)
        }
    }
}
