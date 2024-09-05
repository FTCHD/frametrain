'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config.title?.fontFamily ?? 'Roboto')

    return {
        buttons: [
            {
                label: '→',
            },
        ],
        aspectRatio: '1.91:1',
        fonts,
        component: CoverView(config),
        handler: 'page',
    }
}
