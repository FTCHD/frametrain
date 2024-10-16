'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { type Config, PRESENTATION_DEFAULTS } from '..'
import { renderCustomButtons } from '../utils'
import CoverView from '../views/Cover'

export default async function initial({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    const c = Object.keys(config).includes('slides') ? config : PRESENTATION_DEFAULTS

    const contentFont = await loadGoogleFontAllVariants(c.slides[0]?.content?.font || 'Roboto')
    const titleFont = await loadGoogleFontAllVariants(c.slides[0]?.title?.font || 'Inter')

    const buttons = await renderCustomButtons(c.slides[0]?.buttons)

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: c.slides[0]?.aspectRatio || '1:1',
        component: CoverView(c.slides[0]),
        handler: 'page',
    }
}
