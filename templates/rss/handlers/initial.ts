'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import CoverView from '../views/Cover'

export default async function initial({
    config,
    params,
}: {
    // GET requests don't have a body.
    config: Config
    params?: {
        info?: {
            title: string
            total: number
            lastUpdated: number
        }
    }
    storage?: Storage
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const info = params?.info || config.info || null
    const buttons: FrameButtonMetadata[] = []

    if (config.rssUrl && info) {
        buttons.push(
            { label: 'Refresh' },
            {
                label: 'Read',
            }
        )
    }

    return {
        buttons,
        fonts: roboto,
        component: CoverView(info),
        handler: 'post',
        params: info ? { lastUpdated: info.lastUpdated, initial: true } : undefined,
    }
}
