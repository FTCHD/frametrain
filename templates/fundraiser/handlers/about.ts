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

    if (config.about.titleStyles?.font) {
        const titleFont = await loadGoogleFontAllVariants(config.about.titleStyles.font)
        fonts.push(...titleFont)
    }

    if (config.about.subtitleStyles?.font) {
        const subtitleFont = await loadGoogleFontAllVariants(config.about.subtitleStyles.font)
        fonts.push(...subtitleFont)
    }

    if (config.about.customStyles?.font) {
        const customFont = await loadGoogleFontAllVariants(config.about.customStyles.font)
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
