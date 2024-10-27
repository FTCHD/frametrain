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
            label: 'View event',
            action: 'link',
            target: `https://lu.ma/${event.id}`,
        })

        if (
            event.endsAt &&
            Date.now() < new Date(event.endsAt).getTime() &&
            event.price.toLowerCase().includes('free')
        ) {
            buttons.push({ label: 'Register' })
        }
    }

    return {
        buttons: [
            ...buttons,
            {
                label: 'Create your own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts: font,
        component: event ? EventView({ event, ...rest }) : CoverView(config),
        aspectRatio: '1.91:1',
        inputText: buttons.length === 2 ? 'Enter your email address' : undefined,
        handler: buttons.length === 2 ? 'register' : undefined,
    }
}
