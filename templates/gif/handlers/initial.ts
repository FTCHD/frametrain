'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    return {
        buttons: [
            { label: `${config.buttonLabel}`, action: 'link', target: `${config.buttonLink}` },
        ],
        image: config.gifUrl,
        aspectRatio: '1.91:1',
        fonts: roboto,
    }
}
