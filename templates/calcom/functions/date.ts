'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Date'
import NextView from '../views/Slot'

import { getCurrentAndFutureDate } from '../utils/getDays'
import { extractDatesAndSlots } from '../utils/extractDatesAndSlots'

export default async function duration(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    let date = params?.date === undefined || params?.date === 'NaN' ? 0 : Number(params?.date)

    const data = await fetch(`https://api.cal.com/v1/event-types?apiKey=${config.apiKey}`, {
        method: 'GET',
    })

    const response = await data.json()

    const eventTypes = response.event_types
    const eventIDs = []
    // biome-ignore lint/style/useConst: <explanation>
    for (let event of eventTypes) {
        if (event.slug == '15min') {
            eventIDs[0] = event.id
        } else if (event.slug == '30min') {
            eventIDs[1] = event.id
        }
    }

    const buttonIndex = body.untrustedData.buttonIndex
    let duration = 0
    let duration_time = '0'

    switch (buttonIndex) {
        case 1: {
            if (params.date === undefined) {
                duration = eventIDs[buttonIndex - 1]
                duration_time = '15'
            } else {
                date = date == 0 ? params.datelen - 1 : date - 1
                duration = params.duration
                duration_time = params.duration_time
            }
            const dates = getCurrentAndFutureDate(config.maxBookingDays)
            const slots = await fetch(
                `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
                {
                    method: 'GET',
                }
            )
            const slotsResponse = await slots.json()

            const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)

            return {
                buttons: [
                    {
                        label: '⬅️',
                    },
                    {
                        label: 'select',
                    },
                    {
                        label: '➡️',
                    },
                ],

                component: PageView(config, duration, datesArray, date, duration_time),
                functionName: 'date',
                params: {
                    durationFixed: 'fixed',
                    duration: duration,
                    date: date,
                    duration_time: duration_time,
                    datelen: datesArray.length,
                },
            }
        }

        case 2: {
            if (params.date === undefined) {
                duration = eventIDs[buttonIndex - 1]
                duration_time = '30'

                const dates = getCurrentAndFutureDate(config.maxBookingDays)
                const slots = await fetch(
                    `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
                    {
                        method: 'GET',
                    }
                )
                const slotsResponse = await slots.json()

                const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)

                return {
                    buttons: [
                        {
                            label: '⬅️',
                        },
                        {
                            label: 'select',
                        },
                        {
                            label: '➡️',
                        },
                    ],

                    component: PageView(config, duration, datesArray, date, duration_time),
                    functionName: 'date',
                    params: {
                        durationFixed: 'fixed',
                        duration: duration,
                        date: date,
                        duration_time: duration_time,
                        datelen: datesArray.length,
                    },
                }
                // biome-ignore lint/style/noUselessElse: <explanation>
            } else {
                // biome-ignore lint/style/useConst: <explanation>
                let slot = params.slot ? 0 : Number.parseInt(params.slot)
                duration = params.duration
                duration_time = params.duration_time

                const dates = getCurrentAndFutureDate(config.maxBookingDays)
                const slots = await fetch(
                    `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
                    {
                        method: 'GET',
                    }
                )
                const slotsResponse = await slots.json()

                const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)

                return {
                    buttons: [
                        {
                            label: '⬅️',
                        },
                        {
                            label: 'select',
                        },
                        {
                            label: '➡️',
                        },
                    ],

                    component: NextView(config, slotsArray[date], 0),
                    functionName: 'slot',
                    params: {
                        durationFixed: 'fixed',
                        duration: duration,
                        date: date,
                        slot: 0,
                        duration_time: duration_time,
                        slotlen: slotsArray[date].length,
                    },
                }
            }
        }
        case 3: {
            date = date == params.datelen - 1 ? 0 : date + 1
            duration = params.duration
            duration_time = params.duration_time
        }
    }

    const dates = getCurrentAndFutureDate(config.maxBookingDays)
    const slots = await fetch(
        `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
        {
            method: 'GET',
        }
    )
    const slotsResponse = await slots.json()

    const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)

    return {
        buttons: [
            {
                label: '⬅️',
            },
            {
                label: 'select',
            },
            {
                label: '➡️',
            },
        ],

        component: PageView(config, duration, datesArray, date, duration_time),
        functionName: 'date',
        params: {
            durationFixed: 'fixed',
            duration: duration,
            date: date,
            duration_time: duration_time,
            datelen: datesArray.length,
        },
    }
}
