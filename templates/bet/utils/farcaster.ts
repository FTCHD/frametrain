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

    const r = (await fetch(`${NEYNAR_API_URL}/farcaster/user/search?q=${username}&limit=3`, options)
        .then((response) => response.json())
        .catch((err) => {
            throw new Error(`Invalid Farcaster username ${username}`)
        })) as { result: { users: any[] } }

    const users = r?.result?.users
    if (!users || users.length === 0) {
        throw new Error(`User not found for username: ${username}`)
    }

    for (const user of users) {
        const { fid, custody_address, username: returnedUsername, pfp_url } = user

        // check if this is the user we want
        if (username === returnedUsername) {
            return { fid, custody_address, returnedUsername, pfp_url }
        }
    }
    throw new Error(`User not found for username: ${username}`)
}
