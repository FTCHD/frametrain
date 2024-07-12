'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [
            {
                label: 'START →',
            },
        ],
        aspectRatio: '1.91:1',
        fonts: roboto,
        component: CoverView({
            title: config.title,
            subtitle: config.subtitle,
            backgroundColor: config.backgroundColor,
            textColor: config.textColor,
        }),
        handler: 'page',
    }
}
