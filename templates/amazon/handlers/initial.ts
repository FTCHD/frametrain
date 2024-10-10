'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'

export default async function initial({
    config,
}: {
    // GET requests don't have a body.
    config: Config
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    const buttons: FrameButtonMetadata[] = []

    if (config.products.length) {
        buttons.push({ label: 'My Wishlist 😁' })
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
        buttons,
        fonts,
        image: config.cover.image,
        component: config.cover.image ? undefined : BasicView(config.cover),
        handler: 'product',
    }
}
