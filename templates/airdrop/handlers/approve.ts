'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import ApprovedView from '../views/Approved'

export default async function approve({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const viewerFid = body.interactor.fid
    const creatorFid = config.creatorId
    if (viewerFid !== creatorFid) {
        throw new FrameError('You are not approved to use this function')
    }

    return {
        buttons: [
            {
                label: 'Home 🏡',
            },
        ],
        component: ApprovedView(),
        handler: 'initial',
    }
}
