import { corsFetch } from '@/sdk/scrape'
import type { Config } from '.'

export async function fetchAmazonProductData(link: string, altPrice?: string) {
    const amazonUrlRegex =
        /https?:\/\/.*?amazon\.[a-zA-Z]+.*\/((gp(\/product)?|dp|ASIN)|(customer-reviews|product-reviews))\/([^\/?]{10,})\S*/g
    const html = await corsFetch(link)
    if (!html) return null
    const url = new URL(link)
    const dom = new DOMParser().parseFromString(html, 'text/html')

    const priceQuery = [
        'span#price',
        'span#price_inside_buybox',
        'span#newBuyBoxPrice',
        '.priceToPay',
        'span#kindle-price',
        'span#a-price',
        'span#a-color-price',
        '.aok-offscreen',
        '.a-offscreen',
        '.a-price',
    ].find(
        (query) =>
            dom?.querySelector(query) && dom?.querySelector(query)?.textContent?.trim() !== ''
    )

    // console.log({
    //     priceQuery,
    //     altPrice,
    //     symbolRaw: dom.querySelector('.a-price-symbol'),
    // })

    const data = {
        title: dom?.querySelector('#productTitle')?.textContent?.trim() || 'No title',
        price: altPrice
            ? altPrice
            : dom?.querySelector(`${priceQuery}`)?.textContent?.replace(/^\s*(.*)\s*$/, '$1') ||
              'No price',
        image:
            dom
                ?.querySelector('#landingImage,#imgBlkFront,#ebooksImgBlkFront')
                ?.getAttribute('src') ??
            'https://images.squarespace-cdn.com/content/v1/5f72a23d347ceb5d40105df4/50f54804-00bf-43f9-8774-4b5948ec5136/amazon-wishlist-logo-01.png',
        stars: dom?.querySelector('.a-icon-alt')?.textContent?.trim() || 'No stars',
        ratings: dom?.querySelector('#acrCustomerReviewText')?.textContent?.trim() || 'No ratings',
        url: link.replaceAll(
            amazonUrlRegex,
            (_0, _1, _2, _3, kind, id) => `${url.origin}/dp/${kind ?? 'product'}/${id}/`
        ),
    }
    return data
}

export async function fetchAmazonWishlistData(urlAmazonWishlist: string) {
    const html = await corsFetch(urlAmazonWishlist)
    if (!html) return []

    const url = new URL(urlAmazonWishlist)

    // const urlAmazonWishlist = 'https://www.amazon.es/registry/wishlist/29REYUQFZ73VG?layout=compact'

    const dom = new DOMParser().parseFromString(html, 'text/html')
    const items = dom.querySelectorAll('.a-spacing-none.g-item-sortable')

    if (!items.length) return []
    const products: Config['products'] = []

    // const regex =
    //     /<li data-id="(.*?)".*?data-price="(.*?)".*?<img.*?src="(.*?)".*?<a.*?title="(.*?)".*?href="(.*?)"/gs

    // const matches = Array.from(html.matchAll(regex))
    // console.log('fetchAmazonWishlistData>> wishlist', matches.length)

    // for (const match of matches) {
    //     console.log({ match })
    //     const productLink = `${url.origin}${match[5]}`
    //     const product = await fetchAmazonProductData(productLink, match[2])

    //     if (product) {
    //         products.push(product)
    //     }
    // }

    console.log('fetchAmazonWishlistData>> wishlist', items.length)

    for (const item of items) {
        const id = item.getAttribute('data-itemid')
        const price =
            item.querySelector('.a-offscreen')?.textContent?.trim() || '(Visit to see price)'
        if (!id) continue
        const link = item.querySelector('#itemName_' + id) as HTMLAnchorElement | null
        if (!link) continue
        const productLink = `${url.origin}${link.href.replace(
            `${process.env.NEXT_PUBLIC_HOST}`,
            ''
        )}`
        const product = await fetchAmazonProductData(productLink, price)

        if (product) {
            products.push(product)
        }
    }

    // console.log('fetchAmazonWishlistData>> products', products)

    return products //.title ? data : null
}
