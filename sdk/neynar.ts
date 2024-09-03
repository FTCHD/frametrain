'use server'
import type { FarcasterChannel, FarcasterUserInfo } from '@/lib/farcaster'

const neynarApiBaseUrl = 'https://api.neynar.com/v2'

export async function getFarcasterProfiles(fids: string[]): Promise<FarcasterUserInfo[]> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }

    const r = (await fetch(
        `${neynarApiBaseUrl}/farcaster/user/bulk?fids=${fids.join(',')}`,
        options
    )
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            return {
                users: [],
            }
        })) as { users: FarcasterUserInfo[] }

    const { users } = r

    return users
}

export async function getFarcasterChannelbyName(id: string): Promise<FarcasterChannel> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }

    const response = (await fetch(`${neynarApiBaseUrl}/farcaster/channel?id=${id}&type=id`, options)
        .then((response) => response.json())
        .catch((_) => {
            return {
                message: 'Error fetching channel',
            }
        })) as { channel: FarcasterChannel } | { message: string }

    if ('message' in response) {
        throw new Error(response.message)
    }

    return response.channel
}

export async function getFarcasterUserChannels(fid: number): Promise<FarcasterChannel[]> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }
    const channels: FarcasterChannel[] = []
    let cursor: string | null = null

    while (true) {
        const url = new URL(`${neynarApiBaseUrl}/farcaster/user/channels`)
        url.searchParams.append('fid', `${fid}`)
        if (cursor) {
            url.searchParams.append('cursor', cursor)
        }
        const r = (await fetch(url.toString(), options)
            .then((response) => response.json())
            .catch((err) => {
                console.error(err)
                return {
                    channels: [],
                    next: { cursor: null },
                }
            })) as { channels: FarcasterChannel[]; next: { cursor: string | null } }

        channels.push(...r.channels)
        cursor = r.next.cursor

        if (!cursor) {
            break
        }
    }

    return channels
}
