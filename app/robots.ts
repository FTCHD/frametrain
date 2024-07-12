import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/f/', '/p', '/api/', '/frames'],
        },
        sitemap: 'https://frametra.in/sitemap.xml',
    }
}