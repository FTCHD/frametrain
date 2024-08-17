import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(LocalizedFormat)
dayjs.extend(advancedFormat)

export { dayjs }
