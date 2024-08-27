'use server'

import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import TextSlide from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { bytesToHex } from 'viem'
import type { Config, Storage } from '..'
import estimate from './estimate'
import initial from './initial'

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
    const buttonIndex = body.validatedData.tapped_button?.index || 1

    if (buttonIndex === 1) {
        return initial({ config })
    }

    if (!(config.pool && transactionId)) {
        throw new FrameError('Transaction hash missing')
    }

    if (params?.buyAmount) {
        return estimate({ body, config, params, storage })
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config.success.title?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.success.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (config.success.subtitle?.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(config.success.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (config.success.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(config.success.bottomMessage.fontFamily)
        fonts.push(...customFont)
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

    if (config.success?.image) {
        buildData['image'] = config.success?.image
    } else {
        buildData['component'] = TextSlide(config.success)
    }

    return buildData as BuildFrameData
}
