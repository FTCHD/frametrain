import { NextResponse } from 'next/server'
import { auth } from './auth'

const publicRoutesRegex = [
    '^/$',
    '/f/(.*)',
    '/api/(.*)',
    '/_next/(.*)',
    '/favicon.ico',
    '/static/(.*)',
    '/_next/image/(.*)',
    '/sitemap.xml',
    '/robots.txt',
    '/dots.svg',
    '/og.png',
    '/pdf.worker.mjs',
]

export default auth((req) => {
    const pathname = req.nextUrl.pathname

    if (publicRoutesRegex.some((route) => pathname.match(route))) {
        return NextResponse.next()
    }

	
    if (!req.auth) {
        // console.log('NO AUTH')
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_HOST}`)
    }
})

