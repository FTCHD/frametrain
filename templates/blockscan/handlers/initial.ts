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
    const coverText: TextSlideProps = {
        title: 'Enter a contract address url to get started',
    }

    if (config.etherscan) {
        buttons.push({ label: 'START' })
        coverText.title = 'Title'
    }

    if (config.coverText) {
        coverText.title = config.coverText.title
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
