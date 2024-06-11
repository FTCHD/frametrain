'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config, State } from '..'
import AboutView from '../views/About'

export default async function about(
    config: Config,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    state?: State,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    params?: any
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
