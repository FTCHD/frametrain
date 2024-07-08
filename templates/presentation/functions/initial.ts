'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { type Config, PRESENTATION_DEFAULTS } from '../types'
import { renderCustomButtons } from '../utils'
import CoverView from '../views/Cover'



export default async function initial(config: Config): Promise<BuildFrameData> {
    let c: Config

    if (Object.keys(config).includes('slides')) c = config
    else c = PRESENTATION_DEFAULTS

    const contentFont = await loadGoogleFontAllVariants(c.slides[0]?.content?.font || 'Roboto')
    const titleFont = await loadGoogleFontAllVariants(c.slides[0]?.title?.font || 'Inter')

    const buttons = await renderCustomButtons(c.slides[0]?.buttons)

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: c.slides[0]?.aspectRatio || '1:1',
        component: CoverView(c.slides[0]),
        functionName: 'page',
    }
}
