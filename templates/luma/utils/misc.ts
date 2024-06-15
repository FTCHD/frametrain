'use server'

import { dayjs } from './dayjs'

export async function formatTimezone(date: string, timezone: string) {
    return Promise.resolve(dayjs(date).tz(timezone).format('LLL'))
}
