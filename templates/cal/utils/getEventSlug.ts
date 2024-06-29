export async function getEventSlug(username: string, eventSlug: string) {
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
