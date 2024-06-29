'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function errors(
    body: FrameActionPayloadValidated,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

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
