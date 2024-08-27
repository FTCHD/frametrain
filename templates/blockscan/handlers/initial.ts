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
        cover.title.text = 'Title'
    }

    if (config.cover) {
        cover.title = config.cover.title
        if (config.cover.title.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(config.cover.title.fontFamily)
            fonts.push(...titleFont)
        }
        if (config.cover.subtitle.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(config.cover.subtitle.fontFamily)
            fonts.push(...titleFont)
        }

        if (config.cover.bottomMessage?.fontFamily) {
            const titleFont = await loadGoogleFontAllVariants(config.cover.bottomMessage.fontFamily)
            fonts.push(...titleFont)
        }
    }

    return {
        fonts,
        buttons,
        image: config.cover.image,
        component: config.cover.image ? undefined : TextSlide(cover),
        handler: 'function',
    }
}
