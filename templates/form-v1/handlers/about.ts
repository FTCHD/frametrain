'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import AboutView from '../views/About'

export default async function about({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants('Roboto')

    return {
        fonts,
        buttons: [
            {
                label: '←',
            },
        ],
        aspectRatio: '1.91:1',
        component: AboutView(config),
        handler: 'input',
    }
}
