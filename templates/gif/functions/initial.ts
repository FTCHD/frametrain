'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    return {
        buttons: [{ label: `${config.buttonLabel}`, action: 'link', target: `${config.buttonLink}` }],
        image: config.gifUrl,
        fonts: roboto,
    }
}
