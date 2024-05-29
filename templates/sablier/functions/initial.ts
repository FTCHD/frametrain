'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import template from '..'
import { getLogoForToken, getStreamData } from '../utils/actions'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const urbanist = await loadGoogleFontAllVariants('Urbanist')
    const catamaran = await loadGoogleFontAllVariants('Catamaran')

    const streamData = await getStreamData(config.streamId || template.initialConfig.streamId)

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
        component: CoverView(data),
        functionName: 'page',
    }
}
