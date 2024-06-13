'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, _: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [{ label: config.cover.label ? config.cover.label : 'START' }],
        fonts: roboto,
        component: config.cover.image ? undefined : CoverView(config),
        functionName: 'page',
        image: config.cover.image ? config.cover.image : undefined,
        aspectRatio: config.cover.image ? '1:1' : undefined,
    }
}
