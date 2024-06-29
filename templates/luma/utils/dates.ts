import Dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import toObject from 'dayjs/plugin/toObject'
import utc from 'dayjs/plugin/utc'

Dayjs.extend(localizedFormat)
Dayjs.extend(timezone)
Dayjs.extend(utc)
Dayjs.extend(advancedFormat)
Dayjs.extend(toObject)

export function formatDate(timezone: string, date: string) {
    return Dayjs(date).tz(timezone).format('dddd, MMMM D @ LT')
}
