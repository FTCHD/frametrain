'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const fonts = []

    const roboto = await loadGoogleFontAllVariants('Roboto')
    fonts.push(...roboto)

    if (config?.title?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.title.fontFamily)
        fonts.push(...titleFont)
    }

    return {
        buttons: [
            {
                label: '→',
            },
        ],
        aspectRatio: '1.91:1',
        fonts: fonts,
        component: CoverView(config),
        handler: 'page',
    }
}
