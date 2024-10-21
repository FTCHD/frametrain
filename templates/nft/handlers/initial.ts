'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import BasicView from '@/sdk/views/BasicView'

export default async function initial({
    body,
    config,
    storage,
    params,
}: {
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const fontSet = new Set(['Inter'])
    const fonts: any[] = []

    const buildData: BuildFrameData = {
        handler: 'page',
    }

    if (config.cover.image) {
        buildData['image'] = config.cover.image
    } else {
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
        buildData['component'] = BasicView(config.cover)
        buildData['fonts'] = fonts
    }

    buildData['buttons'] = buttons

    return buildData
}
