import { parseFeed, Parser } from 'htmlparser2'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(LocalizedFormat)
dayjs.extend(advancedFormat)

function extractText(html: string): string {
    let result = ''
    const parser = new Parser({
        ontext(text) {
            result += text
        },
    })
    parser.write(html)
    parser.end()
    return result.trim()
}

export interface RssFeed {
    title: string
    updatedAt: {
        formatted: string
        unix: number
    }
    posts: {
        title: string
        link: string
        description: string
        pubDate: string
        content: string | null
    }[]
}

export type RssFeedIntro = Pick<RssFeed, 'title' | 'updatedAt'> & {
    total: number
}

export async function fetchRssFeedIntro(url: string): Promise<RssFeedIntro> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch rss feed')
    }

    const content = await response.text()
    const feed = parseFeed(content)

    if (feed === null) {
        throw new Error('Failed to parse feed')
    }

    const date = dayjs(feed.updated)

    return {
        title: extractText(feed.title || ''),
        updatedAt: {
            formatted: date.format('dddd, MMMM Do @ LT'),
            unix: date.unix(),
        },

        total: Array.isArray(feed.items) ? feed.items.length : 1,
    }
}

export async function fetchRssFeed(url: string): Promise<RssFeed> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch rss feed')
    }

    const content = await response.text()
    const feed = parseFeed(content)

    if (feed === null) {
        throw new Error('Failed to parse feed')
    }

    const posts = (Array.isArray(feed.items) ? feed.items : [feed.items]).map((item) => {
        return {
            title: extractText(item.title || ''),
            link: item.link!,
            description: extractText(item.description || 'No description'),
            pubDate: dayjs(item.pubDate).format('dddd, MMMM Do @ LT'),
            content: 'content' in item ? extractText(item.content as string) : null,
        }
    })

    const date = dayjs(feed.updated)

    return {
        title: extractText(feed.title || ''),
        updatedAt: {
            formatted: date.format('dddd, MMMM Do @ LT'),
            unix: date.unix(),
        },
        posts,
    }
}
