'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import TextSlide, { type TextSlideProps } from '@/sdk/components/TextSlide'

export default async function initial({
    config,
}: {
    // GET requests don't have a body.
    config: Config
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const buttons: FrameButtonMetadata[] = []
    const fonts = [...roboto]
    const coverText: TextSlideProps = {
        ...config.coverText,
        title: 'Enter a contract address url to get started',
        subtitle: 'Subtitle',
    }

    if (config.etherscan) {
        buttons.push({ label: 'START' })
        coverText.title = 'Title'
    }

    if (config.coverText) {
        coverText.title = config.coverText.title
        coverText.subtitle = config.coverText.subtitle
        if (config.coverText.titleStyles?.font) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.titleStyles.font)
            fonts.push(...titleFont)
        }
        if (config.coverText.subtitleStyles?.font) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.subtitleStyles.font)
            fonts.push(...titleFont)
        }
    }

    return {
        fonts,
        buttons,
        image: config.coverImage,
        component: config.coverImage ? undefined : TextSlide(coverText),
        handler: 'function',
    }
}
