'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/Slot'
import NextView from '../views/Confirm'

import { getCurrentAndFutureDate } from '../utils/getDays'
import { extractDatesAndSlots } from '../utils/extractDatesAndSlots'

export default async function slot(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const buttonIndex = body.untrustedData.buttonIndex
    switch (buttonIndex) {
        case 1: {
            const slot =
                Number.parseInt(params.slot) == 0
                    ? params.slotlen - 1
                    : Number.parseInt(params.slot) - 1
            const dates = getCurrentAndFutureDate(config.maxBookingDays)
            const slots = await fetch(
                `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${params.duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
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

                component: PageView(config, slotsArray[params.date], slot),
                functionName: 'slot',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotlen: slotsArray[params.date].length,
                },
            }
        }
        case 2: {
            const dates = getCurrentAndFutureDate(config.maxBookingDays)
            const slots = await fetch(
                `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${params.duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
                {
                    method: 'GET',
                }
            )
            const slotsResponse = await slots.json()
            const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)
            return {
                buttons: [
                    {
                        label: 'Decline ❌',
                    },
                    {
                        label: 'Confirm ✅',
                    },
                ],
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
                Number.parseInt(params.slot) == params.slotlen - 1
                    ? 0
                    : Number.parseInt(params.slot) + 1
            const dates = getCurrentAndFutureDate(config.maxBookingDays)
            const slots = await fetch(
                `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${params.duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
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

                component: PageView(config, slotsArray[params.date], slot),
                functionName: 'slot',
                params: {
                    durationFixed: 'fixed',
                    duration: params.duration,
                    date: params.date,
                    slot: slot,
                    slotlen: slotsArray[params.date].length,
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
                label: 'select',
            },
            {
                label: '➡️',
            },
        ],

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
