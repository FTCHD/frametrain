'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import { ImageResponse } from '@vercel/og'
import type { Config, State } from '..'
import { getLogoForToken, getStreamData } from '../utils/actions'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
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

    const r = new ImageResponse(CoverView(data), {
        ...dimensionsForRatio['1.91/1'],
        fonts: [...urbanist, ...catamaran],
    })

    // get image data from vercel/og ImageResponse
    const bufferData = Buffer.from(await r.arrayBuffer())
    const imageData = bufferData.toString('base64')

    return buildFramePage({
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
        config: config,
        aspectRatio: '1.91:1',
        function: 'page',
    })
}
