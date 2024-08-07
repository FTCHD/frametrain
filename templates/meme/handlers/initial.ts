'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const buildData: Record<string, unknown> = {
        buttons: [{ label: 'Create your own meme with FrameTrain' }],
        aspectRatio: config.aspectRatio,
    }

    if (config.memeUrl) {
        buildData.image = config.memeUrl
    } else {
        buildData.component = CoverView()
        buildData.fonts = await loadGoogleFontAllVariants('Roboto')
    }

    return buildData as BuildFrameData
}
