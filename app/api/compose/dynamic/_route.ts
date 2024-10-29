import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        searchParams[key] = value
    })

    if (searchParams.t) {
        const html = await fetch(searchParams.t).then((res) => res.text())
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        })
    }

    const urls = [
        'https://neynar.com',
        'https://x.com',
        'https://twitter.com',
        'https://google.com',
    ]

    const html = await fetch(urls[Math.floor(Math.random() * urls.length)]).then((res) =>
        res.text()
    )

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
