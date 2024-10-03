'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    config,
    storage,
}: {
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config.fontFamily ?? 'Roboto')

    return {
        buttons: [
            { label: 'Bet' },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts,
        component: CoverView(config, storage),
        handler: 'bet',
    }
}
