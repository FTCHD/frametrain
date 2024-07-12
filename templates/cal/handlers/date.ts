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

    let date = params?.date === undefined || params?.date === 'NaN' ? 0 : Number(params?.date)
    const eventIndex = params?.eventSlug
        ? config.events.findIndex((event) => event.slug === params.eventSlug)
        : buttonIndex - 1
    const event = config.events[eventIndex]

    switch (buttonIndex) {
        case 2: {
            if (params.date === undefined) {
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
                        timeZone: 'UTC',
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

            const [_, slotsArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots)
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
                timeZone: 'UTC',
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
    const [datesArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots)

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
        params: {
            date,
            eventSlug: event.slug,
            dateLength: datesArray.length,
        },
    }
}
