import { corsFetch } from '@/sdk/scrape'

// metadata tags pulled from the medium article html
interface BeehiivMetadata {
    author: string | null
    title: string | null
    subtitle: string | null
    image: string | null
}

// One paragraph, heading, or image tag and its contents
type BeehiivElement = {
    tag: string
    text: string
    src?: string
}

// A page (frame) will be made up of an array of elements
export type BeehiivPage = BeehiivElement[]

// Our frame-adapted medium article to be passed back to the inspector
export type BeehiivArticle = {
    pages: BeehiivPage[]
    url: string
    metadata: BeehiivMetadata
}

// Entry function to pass in a medium article URL and return an Article to the inspector
export async function getBeehiivArticle(url: string): Promise<BeehiivArticle | null> {
    console.log('fetching beehiiv article', url)
    const response = await corsFetch(`${url}?_data=routes%2Fp%2F%24slug`)
    if (!response) throw new Error('Invalid beehiv article')

    const data = JSON.parse(response) as {
        post: {
            web_title: string
            web_subtitle: string
            post_date: string
            image_url: string
        }
        html: string
        publication: {
            name: string
            authors: [
                {
                    name: string
                    profile_picture: { url: string }
                },
            ]
        }
        truncatedHtml: string
        requestUrl: string
    }

    const requestBaseUrl = new URL(data.requestUrl)
    const articleBaseUrl = new URL(url)
    const requestUrl = `${requestBaseUrl.host}${requestBaseUrl.pathname}`
    const articleUrl = `${articleBaseUrl.host}${articleBaseUrl.pathname}`

    if (requestUrl !== articleUrl) {
        throw new Error('Invalid beehiv article')
    }

    const metadata: BeehiivMetadata = {
        author: data.publication.name,
        title: data.post.web_title,
        subtitle: data.post.web_subtitle,
        image: data.post.image_url,
    }
    const extractedTags: BeehiivElement[] = extractTagsFromHTML(data.truncatedHtml, metadata)

    const article = { pages: paginateElements(extractedTags, metadata), url, metadata } // character limit
    return article
}

// Attempts to pull out only the relevant content from the HTML - paragraph, heading, and image tags, stripped of attributes
function extractTagsFromHTML(htmlContent: string, metadata: BeehiivMetadata): BeehiivElement[] {
    const tempDiv = document.createElement('article')
    tempDiv.innerHTML = htmlContent

    // Get the relevant child elements from the article tag
    const article = tempDiv.querySelector('#content-blocks')
    const elements = article?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img')

    if (!elements) return []

    const elementsArray: HTMLElement[] = Array.from(elements) as HTMLElement[]

    // Filter images - remove images that match the author, publication, or cover image, or if they're really small
    const indexesToRemove: number[] = []
    elementsArray.forEach((element, index) => {
        if (element.tagName === 'IMG') {
            const alt = element.getAttribute('alt')
            const src = element.getAttribute('src')
            const width = Number.parseInt(element.getAttribute('width') || '') || 0
            if (
                width < 300 ||
                alt === 'Top highlight' ||
                alt === metadata.author ||
                (src &&
                    metadata.image &&
                    getFilenameFromUrl(src) == getFilenameFromUrl(metadata.image))
            ) {
                // keep track of indexes to remove
                indexesToRemove.push(index)
            }
        }
    })
    // remove elements without iterating the same array
    for (let i = indexesToRemove.length - 1; i >= 0; i--) {
        elementsArray.splice(indexesToRemove[i], 1)
    }

    // Clean elements so we only have the tag and its contents, and src if it's an image
    const cleanedElements: BeehiivElement[] = elementsArray
        .map((e) => {
            return {
                tag: e.tagName,
                text: e.textContent?.trim() || '',
                src: e.getAttribute('src') || '',
            }
        })
        .filter((e) => e.text.length > 0 || e.src.length > 0)

    return cleanedElements
}

// Function to estimate the number of chars per line for each element based on its type
function estimateElementCharsAndLines(element: BeehiivElement): number {
    const linesPerType: any = {
        'p': 80,
        'h1': 40,
        'h2': 60,
        'h3': 70,
        'h4': 70,
        'h5': 70,
        'other': 80,
    }

    return linesPerType[element.tag] || linesPerType['other']
}

function paginateElements(elements: BeehiivElement[], metadata: BeehiivMetadata): BeehiivPage[] {
    // ignore elements if their text is equal to certain keywords including author, 'Follow', 'Listen', 'Share', or just a number
    const filteredElements = elements.filter((element) => {
        const text = element.text.trim()
        return !(
            [
                'Follow',
                'Listen',
                'Share',
                metadata.author,
                metadata.title,
                'About',
                'Contact',
                'Sign Up',
                'Subscribe',
                ' | ',
                'Subscribe now',
                ' View more posts → ',
                ' View more new products → ',
                'Top highlight',
                'Advertise',
                `Discover more from ${metadata.author}`,
                'beehiv.com',
            ].includes(text) || text.match(/^\d+(\.\d+)?[KMB]?$/)
        )
    })

    // Split elements that are too long
    const chunkedElements: BeehiivElement[] = filteredElements.reduce(
        (acc: BeehiivElement[], currentElement) => {
            const charsPerLine = estimateElementCharsAndLines(currentElement)
            const charsPerPage = charsPerLine * 24 // 24 lines per page
            if (currentElement.text.length > charsPerPage) {
                const newElements: BeehiivElement[] = splitElement(currentElement, charsPerPage)
                acc.push(...newElements)
            } else {
                acc.push(currentElement)
            }
            return acc
        },
        []
    )

    const pages: BeehiivPage[] = []
    let currentPage: BeehiivPage = []
    let currentPageLinesRemaining = 24 // 24 lines per page

    for (const currentElement of chunkedElements) {
        const currentElementEstimatedCharsPerLine = estimateElementCharsAndLines(currentElement)
        const currentElementLinesRequired = currentElement.src
            ? 15 // images take up 15 lines
            : currentElement.text.length / currentElementEstimatedCharsPerLine + 2

        // If this element will exceed the lines remaining, then create a new page
        if (currentPageLinesRemaining - currentElementLinesRequired <= 0) {
            pages.push(currentPage)
            currentPageLinesRemaining = 24
            currentPage = []
        }

        currentPage.push(currentElement)
        currentPageLinesRemaining -= currentElementLinesRequired
    }

    // Add the last page if it contains any elements
    if (currentPage.length > 0) {
        pages.push(currentPage)
    }

    return pages
}

// splits an element into multiple elements based on a character limit
function splitElement(element: BeehiivElement, charLimit: number): BeehiivElement[] {
    const { text } = element

    let currentLength = 0
    const newElements: BeehiivElement[] = []
    const words = text.split(' ')
    let currentText = ''

    for (const word of words) {
        const wordLength = word.length

        if (currentLength + wordLength > charLimit) {
            // Add the current text to the current page
            newElements.push({ tag: element.tag, text: currentText })

            // Reset the current text and length
            currentText = ''
            currentLength = 0
        }

        currentText += word + ' '
        currentLength += wordLength
    }

    // Add the last element
    newElements.push({ tag: element.tag, text: currentText })

    return newElements
}

// Function to extract metadata from the provided HTML content

// Helper function to extract the filename from a URL
function getFilenameFromUrl(url: string) {
    if (!url) return ''
    return url.substring(url.lastIndexOf('/') + 1)
}

export default getBeehiivArticle
