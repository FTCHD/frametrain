'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ProductView from '../views/Product'
import initial from './initial'

export default async function page({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params:
        | {
              currentPage: string
              navigation: string
          }
        | undefined
}): Promise<BuildFrameData> {
    await runGatingChecks(body, config.gating)

    if (!config.products.length) {
        throw new FrameError('Wishlist is empty!')
    }

    const fontSet = new Set(['Roboto'])
    const buttonIndex = body.tapped_button?.index || 1
    const isFromNavigation = params?.navigation === 'true'
    const fonts: any[] = []

    if (isFromNavigation && buttonIndex === 1) {
        return initial({ config })
    }

    let currentPage: number = isFromNavigation ? Number(params.currentPage) : 0
    console.log('let currentPage = 0', currentPage)
    currentPage = currentPage > config.products.length || currentPage < 0 ? 0 : currentPage

    console.log('currentPage', { currentPage, buttonIndex })

    const nextPage =
        // currentPage > config.products.length || currentPage < config.products.length
        //     ? 1
        // :
        buttonIndex === 2 ? currentPage - 1 : currentPage + 1

    console.log('nextPage', nextPage)

    const product = config.products[currentPage]
    console.log('product', product)

    if (product.styles?.title?.fontFamily) {
        fontSet.add(product.styles.title.fontFamily)
    }

    if (product.styles?.info?.fontFamily) {
        fontSet.add(product.styles.info.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        fonts,
        buttons: [
            {
                label: 'Home',
            },
            {
                label: '←',
            },
            {
                label: '→',
            },
            {
                label: 'Visit',
                action: 'link',
                target: product.url,
            },
        ],
        component: ProductView(product),
        handler: nextPage === config.products.length ? 'success' : 'product',
        params: {
            currentPage: nextPage,
            navigation: 'true',
        },
    }
}
