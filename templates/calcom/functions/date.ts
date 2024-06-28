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

    const buttonIndex = body.untrustedData.buttonIndex
    let duration = ''
    let durationTime = '0'

    // try {
    //     const response = await fetch(url)
    //     const data = await response.json()
    //     console.log(data.result.data.json.slots)
    // } catch (error) {
    //     console.error('Error:', error)
    // }

    switch (buttonIndex) {
        case 1: {
            if (params.date === undefined) {
                duration = '15min'
                durationTime = '15'
            } else {
                date = date == 0 ? params.dateLength - 1 : date - 1
                duration = params.duration
                durationTime = params.durationTime
            }
            const dates = getCurrentAndFutureDate(30)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: duration,
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

            const [datesArray, slotsArray] = extractDatesAndSlots(
                slotsResponse.result.data.json.slots
            )

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

                component: PageView(config, duration, datesArray, date, durationTime),
                functionName: 'date',

                params: {
                    durationFixed: 'fixed',
                    duration: duration,
                    date: date,
                    durationTime: durationTime,
                    dateLength: datesArray.length,
                },
            }
        }

        case 2: {
            if (params.date === undefined) {
                duration = '30min'
                durationTime = '30'

                const dates = getCurrentAndFutureDate(30)
                const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                    JSON.stringify({
                        json: {
                            isTeamEvent: false,
                            usernameList: [`${config.username}`],
                            eventTypeSlug: duration,
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

                const [datesArray, slotsArray] = extractDatesAndSlots(
                    slotsResponse.result.data.json.slots
                )

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

                    component: PageView(config, duration, datesArray, date, durationTime),
                    functionName: 'date',
                    params: {
                        durationFixed: 'fixed',
                        duration: duration,
                        date: date,
                        durationTime: durationTime,
                        dateLength: datesArray.length,
                    },
                }
                // biome-ignore lint/style/noUselessElse: <explanation>
            } else {
                // biome-ignore lint/style/useConst: <explanation>
                let slot = params.slot ? 0 : Number.parseInt(params.slot)
                duration = params.duration
                durationTime = params.durationTime

                const dates = getCurrentAndFutureDate(30)
                const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                    JSON.stringify({
                        json: {
                            isTeamEvent: false,
                            usernameList: [`${config.username}`],
                            eventTypeSlug: duration,
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

                const [datesArray, slotsArray] = extractDatesAndSlots(
                    slotsResponse.result.data.json.slots
                )
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
                        durationTime: durationTime,
                        slotLength: slotsArray[date].length,
                    },
                }
            }
        }
        case 3: {
            date = date == params.dateLength - 1 ? 0 : date + 1
            duration = params.duration
            durationTime = params.durationTime
        }
    }
    const dates = getCurrentAndFutureDate(30)
    const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
        JSON.stringify({
            json: {
                isTeamEvent: false,
                usernameList: [`${config.username}`],
                eventTypeSlug: duration,
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

    const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots)

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

        component: PageView(config, duration, datesArray, date, durationTime),
        functionName: 'date',
        params: {
            durationFixed: 'fixed',
            duration: duration,
            date: date,
            durationTime: durationTime,
            dateLength: datesArray.length,
        },
    }
}
