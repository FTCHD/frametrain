import Dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

Dayjs.extend(localizedFormat)
Dayjs.extend(timezone)
Dayjs.extend(utc)

export const dayjs = Dayjs
