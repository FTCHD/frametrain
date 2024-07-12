'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import EventView from '../views/Event'

export default async function initial({ config }: { config: Config }): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const { event, ...rest } = config

    const font = await loadGoogleFontAllVariants('Inter')

    if (event) {
        buttons.push({
            label: 'Join event',
            action: 'link',
            target: `https://lu.ma/${event.id}`,
        })
    }

    buttons.push({
        label: 'Create your own',
        action: 'link',
        target: 'https://frametra.in',
    })

    return {
        buttons,
        fonts: font,
        component: event ? EventView({ event, ...rest }) : CoverView(config),
    }
}
