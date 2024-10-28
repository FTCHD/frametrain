'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
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
        component: config.about.image ? undefined : BasicView(config.about),
        aspectRatio: '1.91:1',
        handler: 'success',
    }
}
