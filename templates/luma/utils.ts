'use server'

import HTMLParser from 'node-html-parser'
import type { EventDetails, HostData, TicketInfo } from './types'
import { dayjs } from './dayjs'

export async function extractEventDetails(url: string): Promise<EventDetails | null> {
    const response = await fetch(url)
    const html = await response.text()
    const root = HTMLParser.parse(html)
    const jsonData = root.getElementById('__NEXT_DATA__')

    if (!jsonData) {
        return null
    }
    const jsonObj = JSON.parse(jsonData.text)

    const data = jsonObj?.props?.pageProps?.initialData?.data
    const eventData = data?.event
    const hostData = data?.hosts as HostData[] | null

    if (!(eventData && hostData)) {
        return null
    }

    const formatAmount = (cents: number, currency = 'usd') => {
        const parser = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        })

        return parser.format(cents / 100)
    }

    const startsAt = (eventData?.start_at ?? '') as string
    const endsAt = (eventData?.end_at ?? '') as string
    const title = (eventData?.name ?? '') as string
    const cover = (eventData?.cover_url ?? '') as string
    const address = (eventData?.geo_address_info?.full_address ?? '') as string
    const obfuscated = eventData?.geo_address_info?.mode === 'obfuscated'
    const onlineEvent = eventData?.location_type === 'offline' ? 'OFFLINE' : 'ONLINE'
    const descriptions = eventData?.description_mirror?.content ?? []
    const desc = (
        descriptions as Array<{
            type: 'paragraph'
            content: { type: string; text: string }[]
        }>
    ).flatMap((d) => [...d.content])
    const description = desc.length > 0 ? desc[0].text : 'N/A'
    const ticketInfo = data?.ticket_info as TicketInfo | null

    const price = ticketInfo?.price
        ? ticketInfo.is_free
            ? 'FREE'
            : formatAmount(ticketInfo.price.cents, ticketInfo.price.currency)
        : 'N/A'
    const isSoldOut = (eventData?.ticket_info?.is_sold_out ?? false) as boolean

    const eventOrganiserName = hostData?.length === 0 ? undefined : hostData[0].name
    const hosts = hostData.map((h) => {
        const { avatar_url, api_id: _, ...host } = h
        const obj = {
            avatar: avatar_url,
            ...host,
        }
        return obj
    })
    const date = dayjs(startsAt).format('LLL')
    const event = {
        startsAt,
        endsAt,
        title,
        cover,
        address,
        price,
        obfuscated,
        onlineEvent,
        eventOrganiserName,
        description,
        isSoldOut,
        hosts,
        date,
    } as EventDetails

    return event
}
