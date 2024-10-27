'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import BasicView from '@/sdk/views/BasicView'

export default async function success({
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

    if (config.success.image) {
        buildData['image'] = config.success.image
    } else {
        if (config.success.title?.fontFamily) {
            fontSet.add(config.success.title.fontFamily)
        }

        if (config.success.subtitle?.fontFamily) {
            fontSet.add(config.success.subtitle.fontFamily)
        }

        if (config.success.bottomMessage?.fontFamily) {
            fontSet.add(config.success.bottomMessage.fontFamily)
        }

        for (const font of fontSet) {
            const loadedFont = await loadGoogleFontAllVariants(font)
            fonts.push(...loadedFont)
        }
    }

    return {
        buttons,
        fonts,
        image: config.success.image,
        component: config.success.image ? undefined : BasicView(config.success),
    }
}
