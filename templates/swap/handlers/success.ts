'use server'

import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import type { Config } from '..'
import initial from './initial'
import { bytesToHex } from 'viem'
import price from './price'

export default async function success({
    body,
    config,
    params,
    storage,
}: {
    body: FrameValidatedActionPayload
    config: Config
    storage: Storage
    params:
        | {
              buyAmount: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const transactionId = body.validatedData.transaction
        ? bytesToHex(body.validatedData.transaction.hash)
        : undefined

    if (!(config.pool && transactionId)) {
        return initial({ config })
    }

    if (params?.buyAmount) {
        return price({ body, config, params, storage })
    }

    console.info('success', { transactionId })

    return {
        buttons: [
            {
                label: 'View Transaction',
                action: 'link',
                target: `${config.pool.network.explorerUrl}/tx/${transactionId}`,
            },
            {
                label: 'Buy More',
            },
        ],
        image: 'https://pbs.twimg.com/media/F4M9IOlWwAEgTDf.jpg',
        handler: 'initial',
    }
}
