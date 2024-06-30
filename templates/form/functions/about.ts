'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import type { Config, State } from '..'
import AboutView from '../views/About'

export default async function about(
    body: FrameActionPayloadValidated,
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
        aspectRatio: '1.91:1',
        component: AboutView(config),
        functionName: 'input',
    }
}
