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
