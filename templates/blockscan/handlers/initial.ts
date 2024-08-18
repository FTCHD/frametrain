'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import TextSlide from '@/sdk/components/TextSlide'

export default async function initial({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const buttons: FrameButtonMetadata[] = []
    const fonts = [...roboto]
    let component: BuildFrameData['component'] = CoverView()

    if (config.etherscan) {
        buttons.push({ label: 'START' })
    }

    if (config.coverImage) {
        component = undefined
    } else if (config.coverText) {
        if (config.coverText.titleStyles?.font) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.titleStyles.font)
            fonts.push(...titleFont)
        }
        if (config.coverText.subtitleStyles?.font) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.subtitleStyles.font)
            fonts.push(...titleFont)
        }

        component = TextSlide(config.coverText)
    }

    return {
        fonts,
        buttons,
        image: config.coverImage,
        component,
        handler: 'function',
    }
}
