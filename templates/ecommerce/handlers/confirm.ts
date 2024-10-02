'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config } from '..'
import { getSliceProduct } from '../common/slice'
import ProductView from '../views/Product'
import initial from './initial'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'

export default async function confirm({
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
              page: string
              productId: string
          }
        | undefined
}): Promise<BuildFrameData> {
    // const buttons: FrameButtonMetadata[] = [{ label: 'Home' }]
    const buttonIndex = body.tapped_button?.index || 1
    let page = params?.page === undefined ? 1 : Number(params?.page)

    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (!config.storeInfo) {
        throw new FrameError('Store not available')
    }

    // if (!body.address) {
    //     throw new FrameError('Please connect your wallet first')
    // }

    const product = await getSliceProduct(config.storeInfo.id, page)
    console.log({ product, page, buttonIndex })

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

    switch (buttonIndex) {
        case 1: {
            if (page < 1) {
                return initial({ config })
            }
            page -= 1
            break
        }
        case 2: {
            break
        }

        default: {
            page += 1
            break
        }
    }

    return {
        fonts,
        buttons: [
            {
                label: '←',
            },
            {
                label: 'Buy',
                action: 'tx',
                handler: 'txData',
            },
            {
                label: '→',
            },
        ],
        component: ProductView(config, product),
        handler: 'product',
        params: {
            page,
        },
    }
}
