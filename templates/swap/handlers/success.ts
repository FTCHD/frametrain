'use server'

import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView from '@/sdk/views/TextView'
import type { Config, Storage } from '..'
import initial from './initial'

export default async function success({
    body,
    config,
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
    const transactionId = body.validatedData.transaction?.hash
    const buttonIndex = body.validatedData.tapped_button?.index || 1

    if (!config.pool) {
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

    if (config.success?.image) {
        buildData['image'] = config.success?.image
    } else {
        buildData['component'] = TextView(config.success)
    }

    return buildData as BuildFrameData
}
