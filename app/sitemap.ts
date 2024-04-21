import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    // const static = [
    //     '/',
    // ].map((path) => {
    //     return {
    //         url: `https://frametra.in${path}`,
    //     }
    // })

    return [
        {
            url: 'https://frametra.in',
        },
    ]
}
