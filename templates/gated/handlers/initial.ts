'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView from '@/sdk/views/TextView'
import type { Config, Storage } from '..'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

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
        buttons: [{ label: config.label || 'VIEW' }],
        fonts,
        component: TextView(config.cover),
        handler: 'page',
    }
}
