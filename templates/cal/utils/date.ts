import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(utc)

export const months: { [key: number]: string } = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
}

export function getMonthIndex(month: number | string): number {
    const monthArray = Object.values(months)

    if (!isNaN(Number(month))) {
        return monthArray.findIndex((m) => months[Number(month)] === m)
    }

    return monthArray.findIndex((m) => m.toLowerCase() === month + ''.toLowerCase())
}

export function getTimezoneOffset(timezone: string) {
    return dayjs().tz(timezone).format('Z')
}

export function getCurrentAndFutureDate(month: number) {
    const chosenMonth = dayjs().set('month', month)
    const startOfTheMonth = chosenMonth.startOf('month').toISOString()
    const endOfTheMonth = chosenMonth.endOf('month').toISOString()

    return [startOfTheMonth, endOfTheMonth]
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
export function getDurationFormatted(mins: number | undefined) {
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

export function extractDatesAndSlots(data: any, timeZone = 'Europe/London') {
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
                timeZone,
            })
        })
    })

    return [dates, timeSlots]
}

export function parseTime(timeString: string): Date | null {
    const regex12 = /^([01]?[0-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i
    const regex24 = /^([01][0-9]|2[0-3]|[0-9]):([0-5]\d)$/

    const match12 = timeString.match(regex12)
    const match24 = timeString.match(regex24)

    if (match12) {
        let hours = Number.parseInt(match12[1], 10)
        const minutes = Number.parseInt(match12[2], 10)
        const period = match12[3]?.toUpperCase()

        // Adjust hours for 12-hour format
        if (period === 'PM' && hours !== 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        // Create and return a Date object
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        return date
    }
    if (match24) {
        const hours = Number.parseInt(match24[1], 10)
        const minutes = Number.parseInt(match24[2], 10)

        // Create and return a Date object
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        return date
    }
    return null
}

export function getDateIndex(date: string, dates: string[]) {
    if (date.length > 2 || isNaN(Number(date))) {
        return -2
    }

    const day = date.length < 2 ? `0${date}` : date

    const dateIndex = dates.findIndex((d) => d.split('-')[2] === day)
    return dateIndex
}

export function getTimeIndex(hour: string, slots: string[]) {
    const date = parseTime(hour)

    if (!date) return -2

    const userDate = dayjs(date).format('hh:mm A')
    const slotIndex = slots.findIndex((slot) => slot === userDate)
    return slotIndex
}

export function formatDateMonth(day: number, month: number, timezone = 'Europe/London') {
    const date = dayjs().tz(timezone).set('date', day).set('month', month)

    return date.format('dddd, MMMM Do YYYY [GMT]Z')
}
