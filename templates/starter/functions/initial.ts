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
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [{ label: 'VIEW' }],
        fonts: roboto,
        component: CoverView(config),
        handler: 'page',
    }
}
