'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config } from '..'
import PageView from '../views/Page'
import { FrameError } from '@/sdk/error'
import { formatSymbol } from '../utils/shared'

export default async function page({
    body,
    config,
    storage,
    params,
}: {
    body: FrameActionPayload
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
        handler: 'fundraise',
    }
}
