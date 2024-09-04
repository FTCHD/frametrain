'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { getCurrentAndFutureDate, getTimeIndex } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import NextView from '../views/Confirm'
import PageView from '../views/Hour'

export default async function hour({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
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

    const buttonIndex = body.tapped_button.index
    const inputText = body.input?.text
    const month = params?.month === undefined ? new Date().getMonth() : Number(params?.month)
    const dates = getCurrentAndFutureDate(month)

    switch (buttonIndex) {
        case 1: {
            const slot =
                Number.parseInt(params.slot) == 0
                    ? params.slotLength - 1
                    : Number.parseInt(params.slot) - 1
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                fonts: fonts,
                inputText: 'Hour slot as 11:00 PM or 23:00',
                component: PageView(config, slotsArray[params.date], slot, month),
                handler: 'hour',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotLength: slotsArray[params.date].length,
                    month,
                },
            }
        }
        case 2: {
            let slot = Number.parseInt(params.slot)
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                slot = getTimeIndex(inputText, slotsArray[Number(params.date)])

                if (slot === -2) {
                    throw new FrameError('Invalid Day format')
                }

                if (slot === -1) {
                    throw new FrameError('Day not found')
                }
            }

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

                component: NextView(config, datesArray[params.date], slotsArray[params.date][slot]),
                handler: 'confirm',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot,
                    month,
                },
            }
        }

        case 3: {
            const slot =
                Number.parseInt(params.slot) == params.slotLength - 1
                    ? 0
                    : Number.parseInt(params.slot) + 1
            const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
                JSON.stringify({
                    json: {
                        isTeamEvent: false,
                        usernameList: [`${config.username}`],
                        eventTypeSlug: params.duration,
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
                fonts: fonts,
                inputText: 'Hour slot as 11:00 PM or 23:00',
                component: PageView(config, slotsArray[params.date], slot, month),
                handler: 'hour',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotLength: slotsArray[params.date].length,
                    month,
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
        inputText: 'Hour slot as 11:00 PM or 23:00',
        component: PageView(config, [], 0, month),
        handler: 'hour',
        params: {
            durationFixed: 'fixed',
            duration: params.duration,
            date: params.date,
            slot: 0,
            month,
        },
    }
}
