'use server'

export async function scrapeTwitterUser(username: string): Promise<TWUser> {
    const res = await fetch(`${process.env.SCRAPER_URL}/twitter/profile/${username}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res as TWUser
}

export async function scrapeTwitterPost(id: string): Promise<TWTweet> {
    const res = await fetch(`${process.env.SCRAPER_URL}/twitter/tweet/${id}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res as TWTweet
}

export async function scrape({
    url,
    readability = false,
    markdown = false,
}: { url: string; readability?: boolean; markdown?: boolean }) {
    const path = markdown ? 'markdown' : readability ? 'readability' : 'scrape'

    const res = await fetch(`${process.env.SCRAPER_URL}/${path}/${encodeURIComponent(url)}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res
}

export async function corsFetch(url: string, { method = 'GET', headers = {} }: any = {}) {
    const res = await fetch(url, {
        method,
        headers,
    })
        .then((res) => res.text())
        .catch(console.error)

    return res
}
	

interface TWTweet {
    id: string
    createdAt: string
    tweetBy: {
        id: string
        userName: string
        fullName: string
        createdAt: string
        description: string
        isVerified: boolean
        favouritesCount: number
        followersCount: number
        followingsCount: number
        statusesCount: number
        location: string
        pinnedTweet: string
        profileBanner: string
        profileImage: string
    }
    entities: {
        hashtags: Array<string>
        urls: Array<any>
        mentionedUsers: Array<any>
    }
    quoted: string
    fullText: string
    lang: string
    quoteCount: number
    replyCount: number
    retweetCount: number
    likeCount: number
    viewCount: number
    bookmarkCount: number
}

interface TWUser {
    id: string
    userName: string
    fullName: string
    createdAt: string
    description: string
    isVerified: boolean
    favouritesCount: number
    followersCount: number
    followingsCount: number
    statusesCount: number
    location: string
    profileBanner: string
    profileImage: string
}

// export default {
//     twitter: {
//         profile: twitterUser,
//         tweet: twitterTweet,
//     },
//     scrape,
// }
