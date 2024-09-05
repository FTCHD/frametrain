'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { extractDatesAndSlots, getCurrentAndFutureDate, getDateIndex } from '../utils/date'
import PageView from '../views/Day'
import NextView from '../views/Hour'
import MonthView from '../views/Month'

export default async function date({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    params: any
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants(config?.fontFamily ?? 'Roboto')

    const buttonIndex = body.tapped_button.index
    const inputText = body.input?.text
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
                component: NextView(config, slotsArray[date], 0, month),
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
                component: MonthView(config, month, event.formattedDuration),
                handler: 'month',
                inputText: 'Enter month as January or 1',
                params: {
                    month,
                    eventSlug: event.slug,
                    date: params.date,
                },
            }
        }

        default: {
            const currentDate = params.date === undefined ? 0 : Number(params.date)
            const isPreviousButton = buttonIndex === 1

            const previousDate = isPreviousButton ? Math.max(0, currentDate - 1) : currentDate
            const nextDate = isPreviousButton
                ? currentDate
                : params.dateLength === currentDate + 1
                  ? 0
                  : Math.min(currentDate + 1)

            date = isPreviousButton ? previousDate : nextDate
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
