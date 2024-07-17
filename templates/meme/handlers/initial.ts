'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    config,
}: {
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    return {
        buttons: [{ label: 'Create your own meme with FrameTrain' }],
        fonts: roboto,
        component: config.memeUrl ? undefined : CoverView(),
        image: config.memeUrl,
    }
}
