import { corsFetch } from '@/sdk/scrape'

export async function bookCall(
    name: string,
    email: string,
    startTime: string,
    eventTypeId: number,
    user: string
) {
    const url = 'https://cal.com/api/book/event'
    const timeZone = 'UTC'

    const requestBody = {
        responses: {
            name: name,
            email: email,
            location: { value: 'integrations:daily', optionValue: '' },
            guests: [],
        },
        user: user,
        start: startTime,
        timeZone: timeZone,
        eventTypeId: eventTypeId,
        language: 'en',
        metadata: {},
        hasHashedBookingLink: false,
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const responseData = await response.json()

        return responseData // Return the response data if needed
    } catch (error) {
        console.error('Error booking event:', error)
        throw error // Rethrow the error to handle it outside
    }
}

export async function getEventId(username: string, eventSlug: string) {
    const url = `https://cal.com/api/trpc/public/event?batch=1&input={"0":{"json":{"username":"${username}","eventSlug":"${eventSlug}","isTeamEvent":false,"org":null}}}`

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        if (data[0].result.data.json.id) {
            return data[0].result.data.json.id
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
            throw new Error('Invalid response format or missing id')
        }
    } catch (error) {
        console.error('Error fetching event data:', error)
        throw error
    }
}

export async function fetchProfileData(username: string) {
    const response = await corsFetch(`https://cal.com/${username}`)
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

    if (obj.safeBio.length) {
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
