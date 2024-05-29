import type { FarcasterUserInfo } from '@/lib/farcaster'

export async function getInfoForFids(fids: string[]): Promise<FarcasterUserInfo[]> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }

    const r = (await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`,
        options
    )
        .then((response) => response.json())
        .catch((err) => {
            console.error(err)
            return {
                isValid: false,
                message: undefined,
            }
        })) as { users: FarcasterUserInfo[] }

    const { users } = r

    return users
}
