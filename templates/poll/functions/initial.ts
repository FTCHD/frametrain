'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import VoteView from '../views/Vote'

export default async function initial(config: Config, storage: Storage): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: config?.options?.map((option) => ({
            label: option.buttonLabel,
        })),
        aspectRatio: '1.91:1',
        fonts: roboto,
        component: VoteView(config),
        handler: 'vote',
    }
}
