'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'

export default async function success(config: Config, _: State): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Create your own quiz!',
            action: 'link',
            target: 'https://frametra.in',
        },
    ]

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
