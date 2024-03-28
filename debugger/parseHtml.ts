import { frameResultToFrameMetadata } from './frameResultToFrameMetadata'
import { type FrameVNext, vNextSchema } from './validation'

export function parseHtml(html: string) {
    const document = new DOMParser().parseFromString(html, 'text/html')
    const ogImage = document.querySelectorAll(`[property='og:image']`)
    const frameMetaTagsProperty = document.querySelectorAll(`[property^='fc:frame']`)
    const frameMetaTagsName = document.querySelectorAll(`[name^='fc:frame']`)
    const nameTags = Object.assign([], frameMetaTagsName)
    const propertyTags = Object.assign([], ogImage, frameMetaTagsProperty)
    const tags: Record<string, string> = {}

    function processTag(tag: Element, keyName: 'property' | 'name') {
        const key = tag.getAttribute(keyName)
        const value = tag.getAttribute('content')
        if (key && value) {
            tags[key] = value
        }
    }

    for (const nameTag of nameTags) {
        processTag(nameTag, 'name')
    }
    for (const propertyTag of propertyTags) {
        processTag(propertyTag, 'property')
    }

    const parseResult = vNextSchema.safeParse(tags)
    const isValid = parseResult.success
    const errors = parseResult.success ? {} : parseResult.error.flatten().fieldErrors
    const metadata = frameResultToFrameMetadata(tags as FrameVNext)

    return { isValid, errors, tags, metadata }
}