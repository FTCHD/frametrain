'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'

export default async function success({
    config,
}: {
    // GET requests don't have a body.
    config: Config
}): Promise<BuildFrameData> {
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

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        buttons: [
            {
                label: '← Home',
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts,
        image: config.success.image,
        component: config.success.image ? undefined : BasicView(config.success),
        handler: 'initial',
    }
}
