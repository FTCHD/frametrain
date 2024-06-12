'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Page'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    return {
        buttons: [
            {
                label: '←',
            },
        ],
        component: PageView(config),
        functionName: 'initial',
    }
}
