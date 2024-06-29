import { corsFetch } from '@/sdk/scrape'

export const generateImageUrl = (url: string, size: number, quality = 1) => {
    const imageUrl = new URL(url)
    const paths = imageUrl.pathname.split('/')

    return `https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,quality=${quality},width=${size},height=${size}/event-covers/${paths
        .slice(-2)
        .join('/')}`
}

export async function getLumaData(eventId: string) {
    const id = eventId.startsWith('https://lu.ma/') ? eventId.split('https://lu.ma/')[1] : eventId
    if (!id) return

    const url = `https://lu.ma/${id}`
    const html = await corsFetch(url)
    if (!html) {
        return
    }

    const parser = new DOMParser()
    const parsedhtml = parser.parseFromString(html, 'text/html')

    if (!parsedhtml) {
        return
    }
    const jsonData = parsedhtml.getElementById('__NEXT_DATA__')

    if (!jsonData?.textContent) {
        return
    }

    const jsonObj = JSON.parse(jsonData.textContent)

    const initialData = jsonObj?.props?.pageProps?.initialData?.data

    return initialData
}