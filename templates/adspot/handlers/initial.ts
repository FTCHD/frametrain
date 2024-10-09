'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'


export default async function initial({
    body,
    config,
    storage,
    params,
}: {
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [
            {
                label: 'Visit',
                action: 'link',
                target: storage.currentAd.visitLink || config.visitLink,
            },
            { label: 'ℹ️', action: 'post' },
        ],
        fonts: roboto,
        component: CoverView(config, storage),
        handler: 'page',
    }
}
