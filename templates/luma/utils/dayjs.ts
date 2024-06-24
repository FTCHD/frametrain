import Dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import toObject from 'dayjs/plugin/toObject'

Dayjs.extend(localizedFormat)
Dayjs.extend(timezone)
Dayjs.extend(utc)
Dayjs.extend(advancedFormat)
Dayjs.extend(toObject)

export const dayjs = Dayjs
