'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import type { Config, State } from '..'
import PageView from '../views/AfterConfirm'
import FailView from '../views/Failed'

import { getCurrentAndFutureDate } from '../utils/getDays'
import { extractDatesAndSlots } from '../utils/extractDatesAndSlots'
import { getEventSlug } from '../utils/getEventSlug'
import { bookCall } from '../utils/bookCall'

export default async function confirm(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const buttonIndex = body.untrustedData.buttonIndex;
    if(buttonIndex === 1) {
        return {
            buttons: [],
            component: FailView(config),
            functionName: 'initial',
        }
    }
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

    const [datesArray, slotsArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots)
    const date = datesArray[params.date]

    const email = body.untrustedData.inputText
    const eventTypeId = await getEventSlug(config.username, params.duration)
    await bookCall(
        email?.split('@')[0] || '',
        email!,
        slotsResponse.result.data.json.slots[date][params.slot].time,
        eventTypeId,
        config.username
    )

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
