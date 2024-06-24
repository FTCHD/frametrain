export type HostData = {
    api_id: string
    avatar_url: string
    bio_short: string
    instagram_handle: string | null
    last_online_at: string
    linkedin_handle: string | null
    name: string
    tiktok_handle: string | null
    timezone: string | null
    twitter_handle: string | null
    url: string
    username: string
    website: string | null
    youtube_handle: string | null
    is_visible: boolean
    access_level: string
}

type Host = Omit<HostData, 'avatar_url' | 'api_id'> & {
    avatar: string
}

export type TicketInfo = {
    is_free: boolean
    price: {
        cents: number
        currency: string
        is_flexible: boolean
    } | null
    is_sold_out: boolean
    is_near_capacity: boolean
    spots_remaining: number | null
    require_approval: boolean
}

export type EventDetails = {
    startsAt: string
    endsAt: string
    title: string
    cover: string
    address: string
    price: string
    obfuscated: boolean
    onlineEvent: string
    eventOrganiserName: string | undefined
    description: string
    isSoldOut: boolean
    hosts: Host[]
    date: string
}
