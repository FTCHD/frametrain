'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { extractDatesAndSlots, getCurrentAndFutureDate, getMonthIndex, months } from '../utils/date'
import DateView from '../views/Day'
import MonthView from '../views/Month'

export default async function month({
    config,
    body,
    params,
}: {
    body: FrameActionPayload
    config: Config
    params: any
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config?.fontFamily) {
        fontSet.add(config.fontFamily)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if ((config.events || []).length === 0) {
        throw new FrameError('No events available to schedule.')
    }

    const buttonIndex = body.untrustedData.buttonIndex
    const inputText = body.untrustedData.inputText
    const event = config.events.find((event) => event.slug === params.eventSlug)!
    let month = params?.month === undefined ? new Date().getMonth() : Number(params?.month)

    switch (buttonIndex) {
        case 2: {
            if (inputText === undefined || params.month === undefined) {
                break
            }

            if (inputText) {
                const monthIndex = getMonthIndex(inputText)

                if (monthIndex === -1) {
                    throw new FrameError(
                        'Invalid input type. Month must be between 1 and 12 or January to December'
                    )
                }
                month = monthIndex
            }

            const dates = getCurrentAndFutureDate(month)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: event.slug,
                        startTime: dates[0],
                        endTime: dates[1],
                        timeZone: config.timezone || 'Europe/London',

                        duration: null,
                        rescheduleUid: null,
                        orgSlug: null,
                    },
                    meta: {
                        values: {
                            duration: ['undefined'],
                            orgSlug: ['undefined'],
                        },
                    },
                })
            )}`

            const slots = await fetch(url)
            const slotsResponse = await slots.json()
            const [datesArray] = extractDatesAndSlots(
                slotsResponse.result.data.json.slots,
                config.timezone
            )

            if (!datesArray.length) {
                throw new FrameError('No events available to schedule.')
            }

            return {
                fonts,
                buttons: [
                    {
                        label: '⬅️',
                    },
                    {
                        label: 'Select',
                    },
                    {
                        label: '➡️',
                    },
                    {
                        label: 'Change Month',
                    },
                ],
                component: DateView(config, datesArray, params.date, event.formattedDuration),
                inputText: 'Enter day as 02 or 2 or 20',
                params: {
                    eventSlug: event.slug,
                    dateLength: datesArray.length,
                    month,
                    date: params.date,
                },
                handler: 'day',
            }
        }

        default: {
            if (buttonIndex === 1) {
                month =
                    params.month === undefined
                        ? month
                        : month === 0
                          ? Object.values(months).length - 1
                          : month - 1
            } else {
                month =
                    params.month === undefined
                        ? month
                        : month === Object.values(months).length - 1
                          ? 0
                          : month + 1
            }
            break
        }
    }

    return {
        buttons: [
            {
                label: '⬅️',
            },
            {
                label: 'Select',
            },
            {
                label: '➡️',
            },
        ],
        fonts: fonts,
        component: MonthView(config, month, event.formattedDuration),
        handler: 'month',
        inputText: 'Enter month as January or 1',
        params: {
            month,
            eventSlug: params.eventSlug,
            date: params.date,
        },
    }
}
