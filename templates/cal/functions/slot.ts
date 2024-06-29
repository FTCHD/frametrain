'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import type { Config, State } from '..'
import NextView from '../views/Confirm'
import PageView from '../views/Slot'

import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { extractDatesAndSlots } from '../utils/extractDatesAndSlots'
import { getCurrentAndFutureDate } from '../utils/getDays'

export default async function slot(
    body: FrameActionPayloadValidated,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]

    if (config?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.fontFamily)
        fonts.push(...titleFont)
    }

    const buttonIndex = body.untrustedData.buttonIndex
    switch (buttonIndex) {
        case 1: {
            const slot =
                Number.parseInt(params.slot) == 0
                    ? params.slotLength - 1
                    : Number.parseInt(params.slot) - 1
            const dates = getCurrentAndFutureDate(30)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                        label: 'Select',
                    },
                    {
                        label: '➡️',
                    },
                ],
                fonts: fonts,

                component: PageView(config, slotsArray[params.date], slot),
                functionName: 'slot',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotLength: slotsArray[params.date].length,
                },
            }
        }
        case 2: {
            const dates = getCurrentAndFutureDate(30)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                        label: 'Decline ❌',
                    },
                    {
                        label: 'Confirm ✅',
                    },
                ],
                fonts: fonts,

                inputText: 'Enter your email address',

                component: NextView(
                    config,
                    datesArray[params.date],
                    slotsArray[params.date][params.slot]
                ),
                functionName: 'confirm',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: params.slot,
                },
            }
        }

        case 3: {
            const slot =
                Number.parseInt(params.slot) == params.slotLength - 1
                    ? 0
                    : Number.parseInt(params.slot) + 1
            const dates = getCurrentAndFutureDate(30)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                        label: 'Select',
                    },
                    {
                        label: '➡️',
                    },
                ],
                fonts: fonts,

                component: PageView(config, slotsArray[params.date], slot),
                functionName: 'slot',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotLength: slotsArray[params.date].length,
                },
            }
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

        component: PageView(config, [], 0),
        functionName: 'slot',
        params: {
            durationFixed: 'fixed',
            duration: params.duration,
            date: params.date,
            slot: 0,
        },
    }
}
