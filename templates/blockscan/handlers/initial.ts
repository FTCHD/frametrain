'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    config,
}: {
    // GET requests don't have a body.
    config: Config
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const buttons: FrameButtonMetadata[] = []

    if (config.etherscan) {
        buttons.push({ label: 'START' })
    }

    return {
        buttons,
        fonts: roboto,
        component: CoverView(config),
        handler: 'simulate',
    }
}
