'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { bookCall } from '../utils/cal'
import { getEventId } from '../utils/cal'
import { formatDateMonth, getCurrentAndFutureDate } from '../utils/date'
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

    const month = Number.parseInt(params.month, 10)
    const slot = Number.parseInt(params.slot, 10)
    const date = Number.parseInt(params.date, 10)
    const eventTypeSlug = params.duration as string
    const event = config.events.find((evt) => evt.slug === eventTypeSlug)
    const timezone = config.timezone || 'Europe/London'

    if (!(params && event) || buttonIndex === 1) {
        return initial({ config })
    }

    const dates = getCurrentAndFutureDate(month)
    const url = `https://cal.com/api/trpc/public/slots.getSchedule?input=${encodeURIComponent(
        JSON.stringify({
            json: {
                isTeamEvent: false,
                usernameList: [`${config.username}`],
                eventTypeSlug,
                startTime: dates[0],
                endTime: dates[1],
                duration: null,
                rescheduleUid: null,
                orgSlug: null,
                timeZone: timezone,
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
        timezone
    )
    const dateSection = datesArray[params.date]

    const email = body.input?.text || 'N/A'
    const eventTypeId = await getEventId(config.username!, eventTypeSlug)
    const webhooks: NonNullable<BuildFrameData['webhooks']> = []
    const baseWebhookData = {
        id: eventTypeId,
        user_fid: body.interactor.fid,
        user_email: email,
        slug: eventTypeSlug,
    }

    try {
        await bookCall(
            email?.split('@')[0] || '',
            email!,
            slotsResponse.result.data.json.slots[dateSection][slot].time,
            eventTypeId,
            config.username!,
            timezone
        )
        webhooks.push({
            event: 'calbooking.success',
            data: {
                ...baseWebhookData,
                host: config.username,
                date: formatDateMonth(date, month, timezone),
                duration: event.formattedDuration,
                hour_slot: slotsArray[date][slot],
                booked_at: Date.now(),
                timezone,
                cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
            },
        })
    } catch {
        webhooks.push({
            event: 'calbooking.failed',
            data: {
                ...baseWebhookData,
                reason: 'An error occurred during booking.',
            },
        })
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
        webhooks,
    }
}
