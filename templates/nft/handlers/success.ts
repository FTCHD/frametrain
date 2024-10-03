'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config, Storage } from '../types'
import SuccessView from '../views/Success'

export default async function success({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    return {
        buttons: [{ label: 'Back to Marketplace', action: 'post' }],
        component: SuccessView(config),
        handler: 'initial',
    }
}
