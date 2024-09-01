'use server'
import type { BuildFrameData, FrameActionPayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { getCurrentAndFutureDate } from '../utils/date'
import { extractDatesAndSlots } from '../utils/date'
import { holdsErc721, holdsErc1155 } from '../utils/nft'
import DateView from '../views/Day'
import PageView from '../views/Duration'

export default async function duration({
    body,
    config,
}: {
    body: FrameActionPayloadValidated
    config: Config
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

    let containsUserFID = true
    let nftGate = true

    if ((config.events || []).length === 0) {
        throw new FrameError('No events available to schedule.')
    }

    if (
        config.gatingOptions.follower &&
        !body.validatedData.interactor.viewer_context.followed_by
    ) {
        throw new FrameError('Only profiles followed by the creator can schedule a call.')
    }

    if (config.gatingOptions.following && !body.validatedData.interactor.viewer_context.following) {
        throw new FrameError('Please follow the creator and try again.')
    }

    if (config.gatingOptions.recasted && !body.validatedData.cast.viewer_context.recasted) {
        throw new FrameError('Please recast this frame and try again.')
    }

    if (config.gatingOptions.liked && !body.validatedData.cast.viewer_context.liked) {
        throw new FrameError('Please like this frame and try again.')
    }

    if (config.gatingOptions.karmaGating) {
        const url = 'https://graph.cast.k3l.io/scores/personalized/engagement/fids?k=1&limit=1000'
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: `["${config.fid}"]`,
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()

            containsUserFID = data.result.some(
                (item: any) => item.fid === body.validatedData.interactor.fid
            )
        } catch {
            throw new FrameError('Failed to fetch your engagement data')
        }
    }

    if (config.gatingOptions.nftGating) {
        if (body.validatedData.interactor.verified_addresses.eth_addresses.length === 0) {
            throw new FrameError('You do not have a wallet that holds the required NFT.')
        }
        if (config.nftOptions.nftType === 'ERC721') {
            nftGate = await holdsErc721(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                config.nftOptions.nftAddress,
                config.nftOptions.nftChain
            )
        } else {
            nftGate = await holdsErc1155(
                body.validatedData.interactor.verified_addresses.eth_addresses,
                config.nftOptions.nftAddress,
                config.nftOptions.tokenId,
                config.nftOptions.nftChain
            )
        }
    }

    if (!containsUserFID) {
        throw new FrameError('Only people within 2nd degree of connection can schedule a call.')
    }

    if (!nftGate) {
        throw new FrameError(`You need to hold ${config.nftOptions.nftName} to schedule a call.`)
    }

    if (config.events.length === 1) {
        const event = config.events[0]
        const dates = getCurrentAndFutureDate(30)
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
            ],
            component: DateView(config, datesArray, 0, event.formattedDuration),
            inputText: 'Enter a booking date from slide',
            params: {
                date: 0,
                eventSlug: event.slug,
                dateLength: datesArray.length,
            },
            handler: 'date',
        }
    }

    return {
        buttons: config.events.map((event) => ({
            label: event.formattedDuration,
        })),
        fonts: fonts,
        component: PageView(config),
        handler: 'date',
    }
}
