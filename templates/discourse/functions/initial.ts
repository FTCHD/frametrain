'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function initial(config: Config, state: State): Promise<BuildFrameData> {
    const urbanist = await loadGoogleFontAllVariants('Urbanist')

    return {
        buttons: [
            {
                label: 'Open Thread',
            },
        ],
        aspectRatio: '1.91:1',
        fonts: urbanist,
        component: CoverView({
            title: config.title,
            postCount: config.postCount,
        }),
        functionName: 'post',
    }
}
