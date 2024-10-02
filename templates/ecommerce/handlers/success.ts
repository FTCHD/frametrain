'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
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
    const buttonIndex = body.tapped_button?.index || 1
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    const buttons: FrameButtonMetadata[] = []

    if (
        !(params && config.storeAddress && config.storeInfo) ||
        (!transactionId && buttonIndex === 1)
    ) {
        return initial({ config })
    }

    if (!transactionId) {
        throw new FrameError('Transaction hash missing')
    }

    if (config.storeInfo?.products.length) {
        buttons.push({ label: 'Products' })
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

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        storage,
        buttons,
        fonts,
        image: config.success.image,
        component: config.success.image ? undefined : BasicView(config.success),
        handler: 'initial',
    }
}
