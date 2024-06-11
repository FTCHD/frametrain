'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import { updateUserState, UserState } from "./userState";

const grayBackgroundBlackText = '\x1b[46m\x1b[30m'; // Gray background, black text
const reset = '\x1b[0m'; // Reset styles

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    let newState = state;
    newState = Object.assign(state, {
        inputNames: config.fields.map(field => field.fieldName ?? ''),
    })

    updateUserState({ pageType: 'init'})

    const SHARE_FRAME_TEXT = "Check This Out!"
    const SHARE_FRAME_URL = "https://farcaster.xyz"

    const roboto = await loadGoogleFontAllVariants('Roboto')


    console.log(grayBackgroundBlackText);
    console.log('state is',newState);
    
    console.log(reset);

    return {
        buttons: [
            { label: 'About' },
            { label: 'Start' },
            {
                label: 'Share',
                action: 'link',
                target: `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_FRAME_TEXT)}&embeds[]=${encodeURIComponent(SHARE_FRAME_URL)}`
            }
        ],
        state: newState,
        fonts: roboto,
        component: CoverView(config),
        functionName: 'input',
    }
}
