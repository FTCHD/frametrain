'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'

export default async function initial({
    config,
    storage,
}: {
    // GET requests don't have a body.
    config: Config
    storage: Storage
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    const buildData: Record<string, unknown> = {
        storage,
        handler: 'info',
    }

    if (storage.ad) {
        if (storage.ad?.url) {
            buttons.push({
                label: 'Visit',
                action: 'link',
                target: storage.ad.url,
            })
        }
        buildData['image'] = storage.ad.image
    } else if (config.cover.image) {
        buildData['image'] = config.cover.image
    } else {
        for (const font of fontSet) {
            const loadedFont = await loadGoogleFontAllVariants(font)
            fonts.push(...loadedFont)
        }
        buildData['component'] = BasicView(config.cover)
        buildData['fonts'] = fonts
    }

    buttons.push({
        label: 'ℹ️',
    })

    buildData['buttons'] = buttons

    return buildData as BuildFrameData
}
