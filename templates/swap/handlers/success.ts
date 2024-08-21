'use server'

import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import TextSlide from '@/sdk/components/TextSlide'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { bytesToHex } from 'viem'
import type { Config } from '..'
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

    if (config.success.titleStyles?.font) {
        const titleFont = await loadGoogleFontAllVariants(config.success.titleStyles.font)
        fonts.push(...titleFont)
    }

    if (config.success.subtitleStyles?.font) {
        const subtitleFont = await loadGoogleFontAllVariants(config.success.subtitleStyles.font)
        fonts.push(...subtitleFont)
    }

    if (config.success.customStyles?.font) {
        const customFont = await loadGoogleFontAllVariants(config.success.customStyles.font)
        fonts.push(...customFont)
    }

    return {
        fonts,
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
        image: config.success.image,
        handler: 'cover',
        component: config.success?.image ? undefined : TextSlide(config.success),
    }
}
