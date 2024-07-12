'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import { bookCall } from '../utils/cal'
import { getEventId } from '../utils/cal'
import { getCurrentAndFutureDate } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import PageView from '../views/AfterConfirm'
import initial from './initial'

export default async function confirm(
    body: FrameActionPayload,
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

    if (buttonIndex === 1) {
        return initial(config, state)
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

    const [datesArray] = extractDatesAndSlots(slotsResponse.result.data.json.slots)
    const date = datesArray[params.date]

    const email = body.untrustedData.inputText
    const eventTypeId = await getEventId(config.username!, params.duration)

    try {
        await bookCall(
            email?.split('@')[0] || '',
            email!,
            slotsResponse.result.data.json.slots[date][params.slot].time,
            eventTypeId,
            config.username!
        )
    } catch {
        throw new FrameError('Error booking event.')
    }

    return {
        buttons: [
            {
                label: 'Create your own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        fonts: fonts,
        component: PageView(config),
        handler: 'initial',
    }
}
