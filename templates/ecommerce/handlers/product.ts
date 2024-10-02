'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import { getSliceProduct } from '../common/slice'
import ProductView from '../views/Product'
import initial from './initial'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function product({
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
              currentIndex: string
          }
        | undefined
}): Promise<BuildFrameData> {
    // const buttons: FrameButtonMetadata[] = [{ label: 'Home' }]
    const buttonIndex = body.tapped_button?.index || 1

    const nextIndex =
        params?.currentIndex !== undefined
            ? body.tapped_button.index === 1
                ? Number(params?.currentIndex) - 1
                : Number(params?.currentIndex) + 1
            : 1
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (!config.storeInfo) {
        throw new FrameError('Store not available')
    }

    if (body.tapped_button.index === 1 && nextIndex < 1) {
        return initial({ config })
    }

    // if (!body.address) {
    //     throw new FrameError('Please connect your wallet first')
    // }

    const productIndex = config.storeInfo.products[nextIndex - 1]

    const product = await getSliceProduct(config.storeInfo.id, productIndex.id)
    console.log({ product, productIndex, buttonIndex })

    if (config.productTitle?.fontFamily) {
        fontSet.add(config.productTitle.fontFamily)
    }

    if (config.productDescription?.fontFamily) {
        fontSet.add(config.productDescription.fontFamily)
    }

    if (config.productInfo?.fontFamily) {
        fontSet.add(config.productInfo.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        fonts,
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Buy',
                // action: 'tx',
                // handler: 'txData',
            },
            {
                label: '→',
            },
        ],
        component: ProductView(config, product),
        handler: 'product',
        params: {
            navigation: true,
            currentIndex: nextIndex,
        },
    }
}
