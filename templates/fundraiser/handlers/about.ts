'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView from '@/sdk/views/TextView'
import type { Config } from '..'

export default async function about({
    config,
}: {
    body: FramePayloadValidated
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.about.title?.fontFamily) {
        fontSet.add(config.about.title.fontFamily)
    }

    if (config.about.subtitle?.fontFamily) {
        fontSet.add(config.about.subtitle.fontFamily)
    }

    if (config.about.bottomMessage?.fontFamily) {
        fontSet.add(config.about.bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        image: config.about.image,
        component: config.about.image ? undefined : TextView(config.about),
        handler: 'success',
    }
}
