'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'

export default async function initial(config: Config, _state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const eventUrl = 'https://lu.ma/' + config.eventId

    const isDev = process.env.NODE_ENV === 'development'

    return {
        buttons: [
            { label: 'Visit event page', target: eventUrl },
            { label: 'Create a lu.ma Preview Frame', target: 'https://frametra.in' },
        ],
        fonts: roboto,
        component: `http${isDev ? '' : 's'}://${
            isDev ? 'localhost:3000' : process.env.VERCEL_URL
        }/api/og/luma/${config.eventId}`,
    }
}
