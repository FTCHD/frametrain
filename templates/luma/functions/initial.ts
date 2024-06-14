'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import EventView from '../views/Event'
import { extractEventDetails } from '../utils'

export default async function initial(config: Config, _state: State): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const eventUrl = 'https://lu.ma/' + config.eventId
    const event = await extractEventDetails(eventUrl)

    return {
        buttons: [
            { label: 'Visit event page', target: eventUrl },
            { label: 'Create a lu.ma Preview Frame', target: 'https://frametra.in' },
        ],
        fonts: roboto,
        component: EventView(event),
        functionName: 'page',
    }
}
