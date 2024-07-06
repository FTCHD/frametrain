export function getCurrentAndFutureDate(days: number) {
    const formatDate = (date: any) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based, so we add 1
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const currentDate = new Date()
    const futureDate = new Date()
    futureDate.setDate(currentDate.getDate() + days)

    const formattedCurrentDate = formatDate(currentDate)
    const formattedFutureDate = formatDate(futureDate)

    return [formattedCurrentDate, formattedFutureDate]
}

/**
 * Render X mins as X hours or X hours Y mins instead of in minutes once >= 60 minutes
 * @see {@link https://github.com/calcom/cal.com/blob/main/packages/features/bookings/components/event-meta/Duration.tsx#L12}
 * @example getDurationFormatted(90) => '1 hour 30 minutes'
 * @example getDurationFormatted(60) => '1 hour'
 * @example getDurationFormatted(30) => '30 minutes'
 * @example getDurationFormatted(1) => '1 minute'
 *
 * @param mins - number of minutes
 * @returns formatted string
 **/
export const getDurationFormatted = (mins: number | undefined) => {
    if (!mins) return null

    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    // format minutes string
    let minStr = ''
    if (minutes > 0) {
        minStr = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    }
    // format hours string
    let hourStr = ''
    if (hours > 0) {
        hourStr = `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }

    if (hourStr && minStr) return `${hourStr} ${minStr}`
    return hourStr || minStr
}
