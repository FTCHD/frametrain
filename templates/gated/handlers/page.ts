'use server'
import type {
    BuildFrameData,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import { validateGatingOptions } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import DeclineView from '../views/Decline'
import AcceptView from '../views/Accept'

export default async function page({
    body,
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const viewer = body.validatedData.interactor
    const cast = body.validatedData.cast
    const errors: {
        message: string
        type: string
    }[] = []
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Try again',
        },
    ]

    if (!config.owner) {
        throw new FrameError('Frame Owner not configured')
    }

    const validated = await validateGatingOptions({
        user: config.owner,
        option: config.requirements,
        cast: cast.viewer_context,
        viewer,
    })

    if (validated !== null) {
        if (validated.target) {
            buttons.push({
                label: 'View collection',
                action: 'link',
                target: validated.target,
            })
        }
        return {
            buttons,
            component: DeclineView({ errors }),
            handler: 'page',
        }
    }

    buttons.length = 0

    if (config.links.length) {
        config.links.forEach((link, i) => {
            buttons.push({
                label: `Reward #${i + 1}`,
                action: 'link',
                target: link,
            })
        })
    } else {
        buttons.push({
            label: 'Create Your Own Frame',
            action: 'link',
            target: 'https://frametra.in',
        })
    }

    return {
        buttons,
        component: config.rewardImage ? undefined : AcceptView(config),
        image: config.rewardImage || undefined,
    }
}
