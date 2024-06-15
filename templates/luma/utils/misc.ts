'use server'

import { dayjs } from './dayjs'

export async function formatTimezone(date: string, timezone: string) {
    const tz = dayjs(date).tz(timezone).format('LLL z')

    return Promise.resolve(tz)
}
