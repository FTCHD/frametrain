'use server'
import { dimensionsForRatio } from '@/lib/constants'
import type { FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import { ImageResponse } from '@vercel/og'
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
) {
    const buttonIndex = body.untrustedData.buttonIndex

    let frame

    switch (buttonIndex) {
        case 2: {
            const urbanist = await loadGoogleFontAllVariants('Urbanist')

            const streamData = await getStreamData(config.streamId)

            const tokenLogo = await getLogoForToken(streamData.chainId, streamData.asset.address)

            const data = Object.assign(
                {},
                streamData,
                { shape: config.shape },
                { asset: { ...streamData.asset, logo: tokenLogo } }
            )

            const resp = new ImageResponse(TokenView(data), {
                ...dimensionsForRatio['1.91/1'],
                fonts: urbanist,
            })

            // get image data from vercel/og ImageResponse
            const bufferData = Buffer.from(await resp.arrayBuffer())
            const imageData = bufferData.toString('base64')

            frame = await buildFramePage({
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
                image: 'data:image/png;base64,' + imageData,
                aspectRatio: '1.91:1',
                config: config,
                function: 'page',
            })

            break
        }

        case 3: {
            const urbanist = await loadGoogleFontAllVariants('Urbanist')

            const streamData = await getStreamData(config.streamId)
            const history = await getStreamHistory(config.streamId)
			
			const tokenLogo = await getLogoForToken(streamData.chainId, streamData.asset.address)

            const resp = new ImageResponse(
                HistoryView(
                    {
                        ...streamData,
                        asset: { ...streamData.asset, logo: tokenLogo },
                    },
                    history
                ),
                {
                    ...dimensionsForRatio['1.91/1'],
                    fonts: urbanist,
                }
            )

            // get image data from vercel/og ImageResponse
            const bufferData = Buffer.from(await resp.arrayBuffer())
            const imageData = bufferData.toString('base64')

            frame = await buildFramePage({
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
                image: 'data:image/png;base64,' + imageData,
                aspectRatio: '1.91:1',
                config: config,
                function: 'page',
            })

            break
        }

        default: {
            frame = await initial(config, state)
            break
        }
    }

    return {
        frame: frame,
        state: state,
    }
}
