'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import CoverView from '../views/Cover'
import type { Config } from '..'
import { PRESENTATION_DEFAULTS } from '../Inspector'

export default async function initial(config: Config): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const maxPage = Math.max(config?.slides?.length, 1)

    const contentFont = await loadGoogleFontAllVariants(
        config?.slides?.[0]?.content?.font || 'Roboto'
    )
    const titleFont = await loadGoogleFontAllVariants(config?.slides?.[0]?.title?.font || 'Inter')

    if (maxPage > 1)
        buttons.push({
            label: '→',
        })

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: config.slides?.[0]?.aspect || '1:1',
        component: CoverView(config.slides?.[0] || PRESENTATION_DEFAULTS.slides[0]),
        functionName: 'page',
    }
}
