'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import TextSlide from '@/sdk/components/TextSlide'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function about({
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.about.title?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.about.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (config.about.subtitle?.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(config.about.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (config.about.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(config.about.bottomMessage.fontFamily)
        fonts.push(...customFont)
    }

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        image: config.about.image,
        component: config.about.image ? undefined : TextSlide(config.about),
        handler: 'success',
    }
}
