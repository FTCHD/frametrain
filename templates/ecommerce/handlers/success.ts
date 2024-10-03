'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'
import initial from './initial'

export default async function product({
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
    const transactionId = body.transaction?.hash
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (!(params && config.storeAddress && config.storeInfo)) {
        return initial({ config })
    }

    if (!transactionId) {
        throw new FrameError('Transaction hash missing')
    }

    if (config.success.title?.fontFamily) {
        fontSet.add(config.success.title.fontFamily)
    }

    if (config.success.subtitle?.fontFamily) {
        fontSet.add(config.success.subtitle.fontFamily)
    }

    if (config.success.bottomMessage?.fontFamily) {
        fontSet.add(config.success.bottomMessage.fontFamily)
    }

    if (!config.success.image) {
        for (const font of fontSet) {
            const loadedFont = await loadGoogleFontAllVariants(font)
            fonts.push(...loadedFont)
        }
    }

    return {
        storage,
        buttons: [
            {
                label: 'Buy again',
            },
            {
                label: 'View Transaction',
                action: 'link',
                target: `https://basescan.org/tx/${transactionId}`,
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts,
        image: config.success.image,
        component: config.success.image ? undefined : BasicView(config.success),
        handler: 'initial',
    }
}
