'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const SHARE_FRAME_TEXT = config.shareText
    const SHARE_FRAME_URL = `${process.env.NEXT_PUBLIC_HOST}/f/${config.frameId}`

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [
            { label: 'About' },
            { label: 'Start' },
            {
                label: 'Share',
                action: 'link',
                target: `https://warpcast.com/~/compose?text=${encodeURIComponent(
                    SHARE_FRAME_TEXT
                )}&embeds[]=${encodeURIComponent(SHARE_FRAME_URL)}`,
            },
        ],
        fonts: roboto,
        component: CoverView(config),
        functionName: 'input',
    }
}
