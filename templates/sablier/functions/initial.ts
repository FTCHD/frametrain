'use server'
import { dimensionsForRatio } from '@/lib/constants'
import { loadGoogleFontAllVariants } from '@/lib/fonts'
import { buildFramePage } from '@/lib/sdk'
import satori from 'satori'
import type { Config, State } from '..'
import { getLogoForToken, getStreamData } from '../utils/actions'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State) {
    const urbanist = await loadGoogleFontAllVariants('Urbanist')

    console.log('config', config)
	

	
	const streamData = await getStreamData(config.streamId)

    const tokenLogo = await getLogoForToken(streamData.chainId, streamData.asset.address)

    const data = Object.assign(
        {},
        streamData,
        { shape: config.shape },
        { asset: { ...streamData.asset, logo: tokenLogo } }
    )

    console.log('data', data)

    const reactSvg = await satori(CoverView(data), {
        ...dimensionsForRatio['1.91/1'],
        fonts: urbanist,
    })

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
        image: 'data:image/svg+xml;base64,' + Buffer.from(reactSvg).toString('base64'),
        config: config,
        aspectRatio: '1.91:1',
        function: 'page',
    })
}
