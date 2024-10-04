// 'use server'

import { corsFetch } from '@/sdk/scrape'
import { type ProductCart, getProduct, getStoreProducts, payProductsConfig } from '@slicekit/core'
import { http, createConfig } from '@wagmi/core'
import { base } from '@wagmi/core/chains'
import { formatUnits } from 'viem'

const sliceConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http('https://mainnet.base.org'),
    },
})

export async function getSliceStoreInfo(slicerId: number) {
    const response = await corsFetch(`https://slice.so/api/slicer/${slicerId}`)
    if (!response) {
        throw new Error('No store found for this slicer ID')
    }
    const store = JSON.parse(response) as {
        id: number
        name: string
        description: string
        image: string
        tags: string
    }

    return store
}

export async function getSliceProductPaymentPayload(
    slicerId: number,
    productId: number,
    account: `0x${string}`,
    quantity = 1
) {
    const storeProduct = await getProduct(sliceConfig, { slicerId, productId })

    if (!storeProduct) {
        throw new Error('Product not found')
    }
    const product = (Array.isArray(storeProduct) ? storeProduct[0] : storeProduct) as ProductCart

    const cart = Array.from({ length: quantity }, () => product)

    const data = await payProductsConfig(sliceConfig, {
        cart,
        account,
    })

    return data
}

export async function getSliceProducts(slicerId: number) {
    const storeProducts = await getStoreProducts(sliceConfig, { slicerId })

    const products = storeProducts.cartProducts.map((product) => {
        console.log('getSliceProducts >> storeProducts.product', product)
        return {
            id: `${slicerId.toString()}-${product.productId.toString()}`,
            title: product.name,
            description: product.shortDescription!,
            handle: product.productId.toString(),
            variantId: product.externalVariantId
                ? product.externalVariantId.toString()
                : product.productId.toString(),
            variantFormattedPrice:
                product.price === '0'
                    ? 'FREE'
                    : `${formatUnits(BigInt(product.price), product.currency.decimals || 18)} ${
                          product.currency.symbol || 'ETH'
                      }`,
            alt: product.name,
            image: product.images[0] || 'https://slice.so/product_default.png',
            maxPerBuyer: product.maxUnitsPerBuyer,
            isInfinite: product.isInfinite,
            remainingUnits: product.availableUnits,
        }
    })

    return products
}

export async function getSliceProduct(slicerId: number, productId: number) {
    console.log(`Fetching product ${productId} from slicer ${slicerId}`)
    const products = await getProduct(sliceConfig, { slicerId, productId })
    const product = (Array.isArray(products) ? products[0] : products) as ProductCart

    const formattedProduct = {
        id: `${slicerId.toString()}-${product.productId.toString()}`,
        title: product.name,
        description: product.shortDescription!,
        handle: product.productId.toString(),
        variantId: product.externalVariantId
            ? product.externalVariantId.toString()
            : product.productId.toString(),
        variantFormattedPrice:
            product.price === '0'
                ? 'FREE'
                : `${formatUnits(BigInt(product.price), product.currency.decimals || 18)} ${
                      product.currency.symbol || 'ETH'
                  }`,
        alt: product.name,
        image: product.images[0] || 'https://slice.so/product_default.png',
        maxPerBuyer: product.maxUnitsPerBuyer,
        isInfinite: product.isInfinite,
        remainingUnits: product.availableUnits,
        isDigital: !(product.isOnsite && product.isDelivery),
        isOnsite: product.isOnsite,
        isDelivery: product.isDelivery,
        variantType: product.externalProduct?.providerVariantName,
        variants:
            product.externalProduct?.providerVariants
                .filter((v) => v.isActive)
                .map((v) => ({ name: v.variant, remaining: v.availableUnits })) || [],
    }

    return formattedProduct
}

export async function createOrder({
    shippingInfo,
    buyer,
    slicerId,
    transactionHash,
    productId,
}: {
    shippingInfo: unknown
    buyer: unknown
    slicerId: number
    productId: number
    transactionHash: string
}) {
    try {
        const products = await getProduct(sliceConfig, { slicerId, productId })
        const product = (Array.isArray(products) ? products[0] : products) as ProductCart

        const payload = {
            'purchaseParams': [
                {
                    'buyer': '0x3A85CfE3400b9a502497e5B89d017c8e710CE12C',
                    slicerId,
                    'quantity': 1,
                    'currency': '0x0000000000000000000000000000000000000000',
                    'productId': 2,
                    'buyerCustomData': '0x',
                },
            ],
            transactionHash,
            'buyerInfo': {
                'fullName': 'Pokuase Overhead Accra side',
                'country': 'Ghana',
                'state': 'Greater Accra Region',
                'city': 'accra',
                'address': 'Accra - Kumasi Road',
                'postalCode': '009789',
                'notes': '',
                'email': 'itswaptik@gmail.com',
                'phone': '+233 887878978',
                'shippingInfoId': null,
                'consent': true,
            },
            'sliceIds': {
                '1661-2': {
                    'sliceProductId': 2802,
                    'externalProductId': 2024,
                    'externalVariantId': null,
                },
            },
            'totalPrices': [
                { 'amount': '0', 'currency': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
            ],
            slicerId,
        }

        fetch('https://slice.so/api/orders/create', {
            'headers': {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.6',
                'content-type': 'text/plain;charset=UTF-8',
                'priority': 'u=1, i',
                'sec-ch-ua': '"Brave";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1',
            },
            'referrer': 'https://shop.slice.so/',
            'referrerPolicy': 'strict-origin-when-cross-origin',
            'body': JSON.stringify(payload),
            'method': 'POST',
            'mode': 'cors',
            'credentials': 'omit',
        })
    } catch (e) {
        console.error(
            `createOrder >> error for tx/${transactionHash} and slicer/${slicerId}/product/${productId}`,
            e
        )
    }
}
