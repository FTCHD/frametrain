export function extractDatesAndSlots(data: any) {
    const dates = Object.keys(data.slots)
    const timeSlots = dates.map((date) => {
        return data.slots[date].map((slot: any) => {
            const dateObject = new Date(slot.time)
            return dateObject.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })
        })
    })

    return [dates, timeSlots]
}
