import { corsFetch } from '@/sdk/scrape'

export async function fetchProfileData(username: string) {
    const response = await corsFetch(`https://cal.com/${username}`)
    if (!response) return null

    const parser = new DOMParser()
    const parsedhtml = parser.parseFromString(response, 'text/html')
    if (!parsedhtml) return null

    const data = parsedhtml.getElementById('__NEXT_DATA__')
    if (!data?.textContent) return null

    const obj = JSON.parse(data.textContent)
    const profile = obj?.props?.pageProps?.profile as {
        name: string
        username: string
        image: string
    } | null
    return profile
}
