'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { getCurrentAndFutureDate } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import DateView from '../views/Day'
import PageView from '../views/Duration'

export default async function duration({
    body,
    config,
}: {
    body: FramePayloadValidated
    config: Config
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []

    if (config?.fontFamily) {
        fontSet.add(config.fontFamily)
    }

    if ((config.events || []).length === 0) {
        throw new FrameError('No events available to schedule.')
    }

    if (config.enableGating) {
        await runGatingChecks(body, config.gating)
    }

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    if (config.events.length === 1) {
        const event = config.events[0]
        const dates = getCurrentAndFutureDate(new Date().getMonth())
        const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
            JSON.stringify({
                json: {
                    isTeamEvent: false,
                    usernameList: [`${config.username}`],
                    eventTypeSlug: event.slug,
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
        const [datesArray] = extractDatesAndSlots(
            slotsResponse.result.data.json.slots,
            config.timezone
        )

        if (!datesArray.length) {
            throw new FrameError('No events available to schedule.')
        }

        return {
            fonts,
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
                {
                    label: 'Change Month',
                },
            ],
            component: DateView(config, datesArray, 0, event.formattedDuration),
            inputText: 'Enter day as 02 or 2 or 20',
            params: {
                date: 0,
                eventSlug: event.slug,
                dateLength: datesArray.length,
                month: new Date().getMonth(),
            },
            handler: 'day',
        }
    }

    return {
        buttons: config.events.map((event) => ({
            label: event.formattedDuration,
        })),
        fonts: fonts,
        component: PageView(config),
        aspectRatio: '1.91:1',
        handler: 'day',
    }
}
