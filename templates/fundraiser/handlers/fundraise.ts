'use server'
import type {
    BuildFrameData,
    FrameActionPayload,
    FrameButtonMetadata,
    FrameValidatedActionPayload,
} from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import { formatSymbol } from '../utils/shared'

export default async function fundraise({
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
    const buttons: FrameButtonMetadata[] = []
    if (!config.address) {
        throw new FrameError('Fundraise address not found.')
    }

    if (!(config.token?.chain && config.token.symbol)) {
        throw new FrameError('Fundraise token not found.')
    }

    const buttonIndex = body.validatedData.tapped_button.index

    if (config.amounts.length) {
        for (const amount of config.amounts) {
            buttons.push({
                label: formatSymbol(amount, config.token.symbol),
            })
        }
    }

    return {
        buttons,
        aspectRatio: '1:1',
        component: PageView(config),
        handler: 'success',
    }
}
