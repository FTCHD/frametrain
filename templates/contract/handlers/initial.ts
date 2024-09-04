'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView, { type TextViewProps } from '@/sdk/views/TextView'
import type { Config } from '..'

export default async function initial({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const buttons: FrameButtonMetadata[] = []
    const cover: TextViewProps = config.cover

    if (config.etherscan) {
        buttons.push({ label: 'START' })
    } else {
        cover.title.text = 'Enter a contract address url to get started'
    }

    if (config.cover.title?.fontFamily) {
        fontSet.add(config.cover.title.fontFamily)
    }

    if (config.cover.subtitle?.fontFamily) {
        fontSet.add(config.cover.subtitle.fontFamily)
    }

    if (config.cover.bottomMessage?.fontFamily) {
        fontSet.add(config.cover.bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        fonts,
        buttons,
        image: config.cover.image,
        component: config.cover.image ? undefined : TextView(cover),
        handler: 'signature',
    }
}
