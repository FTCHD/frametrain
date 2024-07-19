'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config } from '..'
import PriceView from '../views/Price'
import initial from './initial'

export default async function price({
    body,
    config,
    storage,
    params,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    if (!config.pool) {
        return initial({ config })
    }

    const buttonIndex = body.validatedData.tapped_button.index
    const textInput = body.validatedData.input.text

    console.info('price', { buttonIndex, textInput })

    return {
        buttons: [
            {
                label: '←',
            },
        ],
        component: PriceView(config.pool),
        handler: 'swap',
    }
}
