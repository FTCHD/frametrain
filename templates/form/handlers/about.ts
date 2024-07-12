'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import type { Config } from '..'
import AboutView from '../views/About'

export default async function about({
    config,
}: {
    config: Config
}): Promise<BuildFrameData> {
    return {
        buttons: [
            {
                label: '←',
            },
        ],
        aspectRatio: '1.91:1',
        component: AboutView(config),
        handler: 'input',
    }
}
