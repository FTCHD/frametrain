'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { getCurrentAndFutureDate } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import PageView from '../views/Date'
import NextView from '../views/Slot'

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

    const getDate = () => {
        if (inputText) {
            const date = dates.find((d) => d === inputText)
            if (!date) {
                throw new FrameError('The date you entered is invalid')
            }
            return Number(date)
        }
        return params?.date === undefined || params?.date === 'NaN' ? 0 : Number(params?.date)
    }

    let date = getDate()
    const eventIndex = params?.eventSlug
        ? config.events.findIndex((event) => event.slug === params.eventSlug)
        : buttonIndex - 1
    const event = config.events[eventIndex]

    switch (buttonIndex) {
        case 2: {
            if (!inputText && params.date === undefined) {
                break
            }

            const dates = getCurrentAndFutureDate(30)
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

            const [_, slotsArray] = extractDatesAndSlots(
                slotsResponse.result.data.json.slots,
                config.timezone
            )
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
                handler: 'slot',
                params: {
                    duration: event.slug,
                    date,
                    slot: 0,
                    slotLength: slotsArray[date].length,
                },
            }
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

    const dates = getCurrentAndFutureDate(30)
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
        ],
        fonts,
        component: PageView(config, datesArray, date, event.formattedDuration),
        handler: 'date',
        inputText: 'Enter a booking date from slide',
        params: {
            date,
            eventSlug: event.slug,
            dateLength: datesArray.length,
        },
    }
}
