import Dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

Dayjs.extend(LocalizedFormat)

export const dayjs = Dayjs
