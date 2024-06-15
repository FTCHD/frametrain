'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import CoverView from '../views/Cover'
import renderImagePreview from '../utils/preview'
import { dayjs } from '../utils/dayjs'

export default async function initial(config: Config, _state: State): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []

    if (config.event) {
        buttons.push({
            label: 'Visit event page',
            action: 'link',
            target: `https://lu.ma/${config.event.id}`,
        })
    }

    buttons.push({
        label: 'Create a lu.ma Preview Frame',
        action: 'link',
        target: 'https://frametra.in',
    })

    const image = config.event ? await renderImagePreview({ event: config.event }) : undefined

    return {
        // aspectRatio: '1:1',
        buttons,
        component: config.event ? undefined : CoverView(config),
        image,
    }
}
