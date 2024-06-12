'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import { updateUserState } from './userState'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    let newState = state
    newState = Object.assign(state, {
        inputNames: config.fields.map((field) => field.fieldName ?? ''),
    })

    updateUserState({ pageType: 'init' })

    const SHARE_FRAME_TEXT = config.shareText
    const SHARE_FRAME_URL = config.frameURL

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
        state: newState,
        fonts: roboto,
        component: CoverView(config),
        functionName: 'input',
    }
}
