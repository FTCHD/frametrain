'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { bookCall } from '../utils/cal'
import { getEventId } from '../utils/cal'
import { getCurrentAndFutureDate } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import PageView from '../views/AfterConfirm'
import initial from './initial'

export default async function confirm({
    body,
    config,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    params: any
    storage: Storage
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

    if (buttonIndex === 1) {
        return initial({ config })
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
                duration: null,
                rescheduleUid: null,
                orgSlug: null,
                timeZone: config.timezone || 'Europe/London',
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
    const date = datesArray[params.date]

    const email = body.input?.text
    const eventTypeId = await getEventId(config.username!, params.duration)

    try {
        await bookCall(
            email?.split('@')[0] || '',
            email!,
            slotsResponse.result.data.json.slots[date][params.slot].time,
            eventTypeId,
            config.username!,
            config.timezone || 'Europe/London'
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
