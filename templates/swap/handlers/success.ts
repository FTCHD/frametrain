'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config, Storage } from '..'
import initial from './initial'

export default async function success({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              ts: string
          }
        | undefined
}): Promise<BuildFrameData> {
    const transactionId = body.transaction?.hash
    const buttonIndex = body.tapped_button?.index || 1

    if (!(params && config.pool)) {
        return initial({ config })
    }

    if (!transactionId && buttonIndex === 1) {
        return initial({ config })
    }

    if (!transactionId) {
        throw new FrameError('Transaction hash missing')
    }

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    const buildData: Record<string, any> = {
        fonts,
        buttons: [
            {
                label: 'Buy More',
            },
            {
                label: `View on ${config.pool.network.name}`,
                action: 'link',
                target: `https://${config.pool.network.explorerUrl}/tx/${transactionId}`,
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://www.frametra.in',
            },
        ],
        handler: 'more',
    }
    const ts = Number(params.ts)
    const latestSwapData = storage.swapData[body.interactor.fid].find((tsData) => tsData.ts === ts)
    const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
    const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

    if (latestSwapData) {
        buildData['webhooks'] = {
            event: 'swap.success',
            data: {
                fid: body.interactor.fid,
                pool: {
                    address: config.pool.address,
                    chain: { id: config.pool.network.id, name: config.pool.network.name },
                    pair: `${token0.symbol}/${token1.symbol}`,
                },
                sell_token_symbol: token0.symbol,
                sell_token_address: token0.address,
                sell_token_decimals: token0.decimals,
                buy_token_symbol: token1.symbol,
                buy_token_address: token1.address,
                buy_token_decimals: token1.decimals,
                buy_amount: latestSwapData.amount[0],
                sell_amount: latestSwapData.amount[1],
                transaction_id: transactionId,
            },
        }
    }

    if (config.success?.image) {
        buildData['image'] = config.success?.image
    } else {
        buildData['component'] = BasicView(config.success)
    }

    return buildData as BuildFrameData
}
