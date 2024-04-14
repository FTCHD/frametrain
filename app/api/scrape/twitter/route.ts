import { parseWebpage } from '@/lib/scrape'

export const runtime = 'edge'

export async function POST(req: Request) {
    const r = await parseWebpage(await req.text())

    console.log('WEBPAGE', r)

    let content = r.content

    // delete everything after the "Follow" text, including the text
    content = content.substring(content.indexOf('Follow') + 7, content.length)

    // regex for the following pattern
    // [9:32 PM · Mar 11, 2024] (it's a bracket, time, a dot, full date, and ending bracket)

    const dateRegex = /\[(\d{1,2}:\d{2} [AP]M · )?([A-Z][a-z]{2} \d{1,2}, \d{4})\]/g

    // delete everything after the regex, including the regex
    content = content.substring(0, content.search(dateRegex))

    // the content is a markdown text
    // remove links from it and replace them with bold text

    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g

    // replace the links with bold text (removed for now)
    content = content.replaceAll(linkRegex, '$1')

    r.content = content

    return Response.json(r)
}