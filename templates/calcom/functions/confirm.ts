'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/AfterConfirm'
import FailView from '../views/Failed'

import { getCurrentAndFutureDate } from '../utils/getDays'
import { extractDatesAndSlots } from '../utils/extractDatesAndSlots'

export default async function confirm(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const dates = getCurrentAndFutureDate(config.maxBookingDays)
    const slots = await fetch(
        `https://api.cal.com/v1/slots?apiKey=${config.apiKey}&eventTypeId=${params.duration}&startTime=${dates[0]}&endTime=${dates[1]}`,
        {
            method: 'GET',
        }
    )
    const slotsResponse = await slots.json()
    const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse)
    const date = datesArray[params.date]

    const email = body.untrustedData.inputText

    const requestBody = {
        responses: {
            email: email,
            name: email?.split('@')[0],
            location: 'online',
        },
        start: slotsResponse.slots[date][params.slot].time,
        eventTypeId: Number.parseInt(params.duration),
        timeZone: config.timeZone,
        language: 'en',
        location: '',
        metadata: {},
    }

    // biome-ignore lint/style/noVar: <explanation>
    var myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const raw = JSON.stringify(requestBody)

    const response = await fetch(`https://api.cal.com/v1/bookings?=&apiKey=${config.apiKey}`, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
    })
    const data = await response.json()
    console.log(data)
    if (response.status !== 200) {
        return {
            buttons: [],
            component: FailView(config),
            functionName: 'initial',
        }
    }

    return {
        buttons: [
            {
                label: 'Create your own',
                action: 'link',
                target: 'https://frametrain-hack.vercel.app',
            },
        ],

        component: PageView(config),
        functionName: 'initial',
    }
}
