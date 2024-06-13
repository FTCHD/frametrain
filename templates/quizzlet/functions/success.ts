'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function success(
    body: FrameActionPayload,
    config: Config,
    state: State
): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        },
    ]

    if (body.untrustedData.buttonIndex === 1) {
        return initial(config, state)
    }

    if (config.success.href) {
        buttons.push({
            label: config.success.label ?? 'Open Link',
            action: 'link',
            target: config.success.href,
        })
    }

    return {
        buttons,
        image: config.success.image! ?? undefined,
        aspectRatio: '1:1',
    }
}
