'use server'
import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import TextSlide from '@/sdk/components/TextSlide'

export default async function about({
    config,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    return {
        buttons: [
            {
                label: '←',
            },
        ],
        image: config.about.image,
        component: config.about.image ? undefined : TextSlide(config.about),
        handler: 'success',
    }
}
