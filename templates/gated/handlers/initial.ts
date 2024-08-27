'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import TextSlide from '@/sdk/components/TextSlide'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.cover.title.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.cover.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (config.cover.subtitle.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(config.cover.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (config.cover.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(config.cover.bottomMessage.fontFamily)
        fonts.push(...customFont)
    }

    return {
        buttons: [{ label: config.label || 'VIEW' }],
        fonts,
        component: TextSlide(config.cover),
        handler: 'page',
    }
}
