'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import initial from './initial'

export default async function success(
    body: FrameActionPayload,
    config: Config,
    state: State
): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []

    if (body.untrustedData.buttonIndex === 1) {
        return initial(config, state)
    }

    if (config.success.href && config.success.label) {
        buttons.push({
            label: config.success.label,
            action: 'link',
            target: config.success.href,
        })
    }

    return {
        buttons,
        image: config.success.image! ?? undefined,
    }
}
