'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/page'

export default async function page({
    config,
}: {
    body: FramePayloadValidated
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
