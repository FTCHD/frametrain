'use server'

async function twitterUser(username: string) {
    const res = await fetch(`${process.env.SCRAPER_URL}/twitter/profile/${username}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res
}

async function twitterTweet(id: string) {
    const res = await fetch(`${process.env.SCRAPER_URL}/twitter/tweet/${id}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res
}

async function scrape({
    url,
    readability,
    markdown,
}: { url: string; readability: boolean; markdown: boolean }) {
    const path = markdown ? 'markdown' : readability ? 'readability' : 'scrape'

    const res = await fetch(`${process.env.SCRAPER_URL}/${path}/${encodeURI(url)}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .catch(console.error)

    return res
}


export default {
    twitter: {
        profile: twitterUser,
        tweet: twitterTweet,
    },
    scrape,
}
