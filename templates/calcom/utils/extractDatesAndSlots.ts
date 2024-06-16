export function extractDatesAndSlots(data: any) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input data')
    }

    const dates = Object.keys(data)
    const timeSlots = dates.map((date) => {
        return data[date].map((slot: any) => {
            const dateObject = new Date(slot.time)
            return dateObject.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
            })
        })
    })

    return [dates, timeSlots]
}
