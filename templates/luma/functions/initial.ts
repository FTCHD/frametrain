'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import EventView from '../views/Event'

export default async function initial(config: Config, _state: State): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const { event, ...rest } = config

    if (event) {
        buttons.push({
            label: 'Visit event page',
            action: 'link',
            target: `https://lu.ma/${event.id}`,
        })
    }

    buttons.push({
        label: 'Create a lu.ma Preview Frame',
        action: 'link',
        target: 'https://frametra.in',
    })

    return {
        buttons,
        component: event ? EventView({ event, ...rest }) : CoverView(config),
    }
}
