import { dayjs } from './dayjs'

export function formatDate(timezone: string, date: string, date2: string | null = null) {
    const tz = dayjs(date).tz(timezone).format('dddd, LL @ LT (z)')
    let endsAt: string | null = null

    if (date2) {
        const past = dayjs().isAfter(dayjs(date2), 'day')

        endsAt = `${dayjs(date2).tz(timezone).format('dddd, LL @ LT (z)')}`
        if (past) endsAt += ' [Past Event]'
    }

    return [tz, endsAt]
}
