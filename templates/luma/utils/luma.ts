import { corsFetch } from '@/sdk/scrape'
import type { HostData, TicketInfo } from './types'

export const generateImageUrl = (url: string, size: number, quality = 1) => {
    const imageUrl = new URL(url)

    return `https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,quality=${quality},width=${size},height=${size}/${imageUrl.pathname.slice(
        1
    )}`
}

export async function getLumaData(eventId: string) {
    const id = eventId.startsWith('https://lu.ma/') ? eventId.split('https://lu.ma/')[1] : eventId
    if (!id) return

    const response = await corsFetch(`https://api.lu.ma/url?url=${id}`)

    if (!response) {
        return null
    }

    const json = JSON.parse(response) as
        | { message: string }
        | {
              kind: 'event'
              data: {
                  api_id: string
                  event: {
                      name: string
                      cover_url: string
                      geo_address_info: {
                          obfuscated: boolean
                          city_state: string
                      } | null
                      location_type: string
                      start_at: string
                      end_at: string | null
                      timezone: string | null
                      url: string
                  }
                  sold_out: boolean
                  hosts: HostData[]
                  ticket_info: TicketInfo | null
                  ticket_types: { api_id: string }[]
              }
          }

    if ('message' in json) {
        return null
    }
    return json.data
}
