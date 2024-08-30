'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'

export default async function initial({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const buttons: FrameButtonMetadata[] = []
    const fonts = [...roboto]
    const cover: TextSlideProps = config.cover

    if (config.etherscan) {
        buttons.push({ label: 'START' })
    } else {
        cover.title.text = 'Enter a contract address url to get started'
    }

    // Load additional fonts if specified in the view configuration
    const loadAdditionalFonts = async (fontFamily?: string) => {
        if (fontFamily) {
            const additionalFonts = await loadGoogleFontAllVariants(fontFamily)
            fonts.push(...additionalFonts)
        }
    }
    if (config.cover) {
        // Load additional fonts specified in the view configuration
        await Promise.all(
            [
                config.cover.title.fontFamily,
                config.cover.subtitle.fontFamily,
                config.cover.bottomMessage?.fontFamily,
            ]
                .filter(Boolean)
                .map(loadAdditionalFonts)
        )
    }

    return {
        fonts,
        buttons,
        image: config.cover.image,
        component: config.cover.image ? undefined : TextSlide(cover),
        handler: 'function',
    }
}
