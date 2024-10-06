'use server'

const NEYNAR_API_URL = 'https://api.neynar.com/v2'

export async function getUserDataByFarcasterUsername(username: string) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            api_key: process.env.NEYNAR_API_KEY!,
            'content-type': 'application/json',
        },
    }

    const r = (await fetch(`${NEYNAR_API_URL}/farcaster/user/search?q=${username}&limit=1`, options)
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(`Invalid Farcaster username ${username}`)
        })) as { result: { users: any[] } }

    const user = r?.result?.users?.[0];
    if (!user) {
        throw new Error(`User not found for username: ${username}`)
    }

    const { fid, custody_address, username: returnedUsername, pfp_url } = user

    // check if this is the user we want
    if (username != returnedUsername) {
      throw new Error(`User not found for username: ${username}, returned ${returnedUsername}`)
    }

    return { fid, custody_address, returnedUsername, pfp_url }
}