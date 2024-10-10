'use server'
import { XMLParser } from 'fast-xml-parser'
import type { Episode, PodcastData } from '../types'

export async function fetchPodcastData(rssFeedUrl: string): Promise<PodcastData> {
    const response = await fetch(rssFeedUrl)
    const xmlData = await response.text()

    const parser = new XMLParser()
    const jsonObj = parser.parse(xmlData)

    const channel = jsonObj.rss.channel

    const episodes: Episode[] = channel.item.map((item: any) => ({
        title: item.title,
        description: item.description,
        pubDate: item.pubDate,
        duration: item['itunes:duration'],
        url: item.enclosure['@_url'],
    }))

    return {
        title: channel.title,
        description: channel.description,
        imageUrl: channel.image.url,
        episodes,
    }
}
