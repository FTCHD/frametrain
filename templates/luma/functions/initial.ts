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
            label: 'Get Event Link',
        })
    }

    return {
        aspectRatio: '1:1',
        buttons,
        component: event ? EventView({ event, ...rest }) : CoverView(config),
        functionName: 'page',
    }
}
