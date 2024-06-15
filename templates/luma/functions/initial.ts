'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'

export default async function initial(config: Config, _state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const eventUrl = 'https://lu.ma/' + config.eventId

    return {
        buttons: [
            { label: 'Visit event page', target: eventUrl },
            { label: 'Create a lu.ma Preview Frame', target: 'https://frametra.in' },
        ],
        fonts: roboto,
        component: `${process.env.NEXT_PUBLIC_HOST}/api/og/luma/${config.eventId}`,
    }
}
