import { parseHtml } from './parseHtml'

export async function fetchFrame(url: string) {
    const response = await fetch('/api/getFrame', {
        method: 'POST',
        headers: {
            contentType: 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ url }),
    })

    const json = (await response.json()) as { html: string }
    const html = json.html
    return parseHtml(html)
}
