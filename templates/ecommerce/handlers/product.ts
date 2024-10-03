'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import { getSliceProduct } from '../common/slice'
import ProductView from '../views/Product'
import initial from './initial'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { runGatingChecks } from '@/lib/gating'

export default async function product({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              currentIndex: string
              navigation: string
          }
        | undefined
}): Promise<BuildFrameData> {
    await runGatingChecks(body, config.gating)

    const buttonIndex = body.tapped_button?.index || 1
    const isFromNavigation = params?.navigation === 'true'
    let nextIndex =
        params?.currentIndex !== undefined
            ? body.tapped_button.index === 2
                ? Number(params?.currentIndex)
                : body.tapped_button.index === 1
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

    if (config.productTitle?.fontFamily) {
        fontSet.add(config.productTitle.fontFamily)
    }

    if (config.productDescription?.fontFamily) {
        fontSet.add(config.productDescription.fontFamily)
    }

    if (config.productInfo?.fontFamily) {
        fontSet.add(config.productInfo.fontFamily)
    }

    nextIndex = nextIndex > config.storeInfo.products.length || nextIndex < 1 ? 1 : nextIndex

    const productFromArray = config.storeInfo.products[nextIndex - 1]

    const product = await getSliceProduct(config.storeInfo.id, productFromArray.id)
    console.log('product handler >> getSliceProduct', product)

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if (isFromNavigation && buttonIndex === 2) {
        const buttons: FrameButtonMetadata[] = []
        if (productFromArray.variants.length) {
            for (const v of productFromArray.variants) {
                buttons.push({
                    label: v.variant,
                })
            }
        } else {
            buttons.push({
                label: 'Continue',
            })
        }

        return {
            fonts,
            buttons,
            component: ProductView(config, product),
            handler: 'confirm',
            inputText: 'Quantity (default 1)',
            params: {
                productId: productFromArray.id,
                action: 'quantity',
            },
        }
    }

    return {
        fonts,
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Continue',
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
