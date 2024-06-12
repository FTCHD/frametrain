'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [{ label: 'Github', action: 'link', target: `https://github.com/${config.name}` }],
        fonts: roboto,
        component: CoverView(config),
        functionName: 'initial',
    }
}
