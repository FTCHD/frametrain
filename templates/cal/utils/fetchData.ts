import { corsFetch } from '@/sdk/scrape'

export async function fetchProfileData(slug: string) {
    const response = await corsFetch(`https://cal.com/${slug}`)
    if (!response) return null

    const parser = new DOMParser()
    const parsedhtml = parser.parseFromString(response, 'text/html')
    if (!parsedhtml) return null

    const nextData = parsedhtml.getElementById('__NEXT_DATA__')
    if (!nextData?.textContent) return null

    const obj = JSON.parse(nextData.textContent)?.props?.pageProps
    const profile = obj?.profile as {
        name: string
        username: string
        image: string
    } | null

    const bio: string[] = []

    console.log({ profile, obj })

    if (obj.safeBio.length) {
        // Parse the bio to get the text content only of each child element
        const body = parser.parseFromString(obj.safeBio, 'text/html').body.children
        for (const child of body) {
            if (child.textContent) bio.push(child.textContent)
        }
    }

    const data = profile
        ? {
              name: profile.name,
              username: profile.username,
              image: profile.image,
              bio,
          }
        : undefined

    return data
}
