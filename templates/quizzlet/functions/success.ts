'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function success(
    body: FrameActionPayload,
    config: Config,
    state: State
): Promise<BuildFrameData> {
    if (body.untrustedData.buttonIndex === 1) {
        return initial(config, state)
    }

    return {
        buttons: [
            {
                label: config.success.label!,
                action: 'link',
                target: config.success.href!,
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        image: config.success.image! ?? undefined,
    }
}
