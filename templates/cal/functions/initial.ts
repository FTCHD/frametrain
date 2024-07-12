'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, storage: Storage): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.fontFamily)
        fonts.push(...titleFont)
    }

    return {
        buttons: [{ label: 'Schedule' }],
        fonts: fonts,
        component: CoverView(config),
        handler: 'duration',
    }
}
