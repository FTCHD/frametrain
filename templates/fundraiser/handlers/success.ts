'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import SuccessView from '../views/Success'

export default async function success({
    body,
    config,
    storage,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    return {
        buttons: [
            {
                label: 'Back',
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://www.frametra.in',
            },
        ],
        aspectRatio: '1:1',
        component: SuccessView(config),
        handler: 'initial',
    }
}
