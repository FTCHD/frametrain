'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import PageView from '../views/page'

export default async function page({
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
    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: [
            {
                label: '← Back to Magic 8 Ball',
            },
        ],
        fonts: roboto,
        component: PageView(config, storage, params),
        handler: 'initial',
    }
}
