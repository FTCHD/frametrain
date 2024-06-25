import { dayjs } from './dayjs'

export function formatDate(timezone: string, date: string, date2: string | null = null) {
    let tz = dayjs(date).tz(timezone).format('dddd, LL @ LT (z)')
    let endsAt: string | null = null

    if (date2) {
        const start = dayjs(dayjs(date).tz(timezone)).toObject()
        const end = dayjs(dayjs(date2).tz(timezone)).toObject()
        const past = dayjs().isAfter(dayjs(date2), 'day')
        if (start.date == end.date) {
            const endsAt = dayjs(date2).tz(timezone).format('LT')
            tz = `${dayjs(date).tz(timezone).format('dddd, LL @ LT')} - ${endsAt} ${dayjs(date)
                .tz(timezone)
                .format('(z)')}`
            if (past) tz += ' [Past Event]'
        } else {
            endsAt = `${dayjs(date2).tz(timezone).format('dddd, LL @ LT (z)')}`
            if (past) endsAt += ' [Past Event]'
        }
    }

    return [tz, endsAt]
}
