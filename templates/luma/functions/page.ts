'use server'

import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config, State } from '..'
import EventView from '../views/Event'
import initial from './initial'

export default async function page(
    body: FrameActionPayload | FrameValidatedActionPayload,
    config: Config,
    state: State
): Promise<BuildFrameData> {
    const { event, ...rest } = config
    const user = body.untrustedData.fid.toString()

    if (!event) {
        return initial(config, state)
    }

    const existingUser = config.fids.find((u) => u === user)

    if (!existingUser) {
        config.fids.push(user)
    }

    return {
        aspectRatio: '1:1',
        buttons: [
            {
                label: 'Event page',
                action: 'link',
                target: `https://lu.ma/${event.id}`,
            },
            {
                label: 'Get a Preview Frame for your Lu.ma event',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        component: EventView({ event, ...rest }),
    }
}
