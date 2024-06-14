import HTMLParser from 'node-html-parser'
import type { EventDetails, HostData, TicketInfo } from './types'
import Dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

Dayjs.extend(LocalizedFormat)

export const dayjs = Dayjs

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

export function formatAmount(cents: number, currency = 'usd') {
    const parser = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    })

    return parser.format(cents / 100)
}

export function generateSocialCard({
    title,
    img,
}: {
    title: string
    img: string
}) {
    const baseUrl =
        'https://social-images.lu.ma/cdn-cgi/image/format=auto,fit=cover,dpr=1,quality=75,width=800,height=419/api/event-one'
    const url = new URL(baseUrl)

    const params: Record<string, string> = {
        color0: '#6c5041',
        color1: '#271917',
        color2: '#af9b85',
        color3: '#cdd0d1',
        name: title,
        img,
    }

    for (const key in params) {
        url.searchParams.append(key, params[key])
    }

    return url.toString()
}
