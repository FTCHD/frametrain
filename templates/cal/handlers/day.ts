'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { extractDatesAndSlots, getCurrentAndFutureDate, getDateIndex } from '../utils/date'
import PageView from '../views/Day'
import NextView from '../views/Hour'

export default async function date({
    body,
    config,
    params,
}: {
    body: FrameActionPayload
    config: Config
    params: any
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config?.fontFamily ?? 'Roboto')

    const buttonIndex = body.untrustedData.buttonIndex
    const inputText = body.untrustedData.inputText
    const month = params?.month === undefined ? new Date().getMonth() : Number(params?.month)
    const dates = getCurrentAndFutureDate(month)

    let date = 0
    const eventIndex = params?.eventSlug
        ? config.events.findIndex((event) => event.slug === params.eventSlug)
        : buttonIndex - 1
    const event = config.events[eventIndex]

    switch (buttonIndex) {
        case 2: {
            if (!inputText && params.date === undefined) {
                break
            }

            date = Number.parseInt(params.date)

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

            const [datesArray, slotsArray] = extractDatesAndSlots(
                slotsResponse.result.data.json.slots,
                config.timezone
            )

            if (inputText) {
                date = getDateIndex(inputText, datesArray)

                if (date === -2) {
                    throw new Error('Invalid Day format')
                }
                if (date === -1) {
                    throw new Error('Day not found')
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
                fonts,
                component: NextView(config, slotsArray[date], 0),
                handler: 'hour',
                inputText: 'Enter hour as 11:00 PM or 23:00',
                params: {
                    duration: event.slug,
                    date,
                    slot: 0,
                    slotLength: slotsArray[date].length,
                    month,
                },
            }
        }

        case 4: {
            break
        }

        default: {
            if (buttonIndex === 1) {
                date =
                    params.date === undefined ? date : date === 0 ? params.dateLength - 1 : date - 1
            } else {
                date =
                    params.date === undefined ? date : date === params.dateLength - 1 ? 0 : date + 1
            }
        }
    }

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
    const [datesArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots, config.timezone)

    if (!datesArray.length) {
        throw new FrameError('No availability found for this event.')
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
            {
                label: 'Change Month',
            },
        ],
        fonts,
        component: PageView(config, datesArray, date, event.formattedDuration),
        handler: 'day',
        inputText: 'Enter day as 03 or 3',
        params: {
            date,
            eventSlug: event.slug,
            dateLength: datesArray.length,
            month,
        },
    }
}
