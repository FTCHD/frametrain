'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'

import FailView from '../views/Failed'
import CoverView from '../views/Cover'

import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function errors(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const fonts = []

    const roboto = await loadGoogleFontAllVariants('Roboto')
    fonts.push(...roboto)

    if (config?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.fontFamily)
        fonts.push(...titleFont)
    }

    return {
        buttons: [{ label: 'Schedule' }],
        fonts: fonts,
        component: CoverView(config),
        functionName: 'duration',
    }
}
