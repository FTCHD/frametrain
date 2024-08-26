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
        title: { text: 'Enter a contract address url to get started' },
        subtitle: { text: 'Subtitle' },
        background: config.coverText?.background,
    }

    if (config.etherscan) {
        buttons.push({ label: 'START' })
        coverText.title.text = 'Title'
    }

    if (config.coverText) {
        coverText.title = config.coverText.title
        coverText.subtitle = config.coverText.subtitle
        coverText.bottomMessage = config.coverText.bottomMessage
        if (config.coverText.title.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.title.fontFamily)
            fonts.push(...titleFont)
        }
        if (config.coverText.subtitle.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(config.coverText.subtitle.fontFamily)
            fonts.push(...titleFont)
        }

        if (config.coverText.bottomMessage?.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(
                config.coverText.bottomMessage.fontFamily
            )
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
