'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'

export default async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    return {
        buttons: [
            {
                label: '←',
            },
        ],
        aspectRatio: '1:1',
        component: PageView(config),
        handler: 'initial',
    }
}
