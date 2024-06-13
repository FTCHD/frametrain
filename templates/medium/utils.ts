import { scrape } from '@/sdk/scrape'

// metadata tags pulled from the medium article html
interface MediumMetadata {
    authorUrl: string | null
    author: string | null
    title: string | null
    image: string | null
}

// One paragraph, heading, or image tag and its contents
export type Element = {
    tag: string
    text: string
    src?: string
}

// A page (frame) will be made up of an array of elements
export type Page = Element[]

// Our frame-adapted medium article to be passed back to the inspector
export type Article = {
    pages: Page[]
    url: string
    metadata: MediumMetadata
}

// Entry function to pass in a medium article URL and return an Article to the inspector 
export async function getMediumArticle(url: string): Promise<Article> {
    
    console.log('scraping medium article', url)
    const res = await scrape({ url })

    const metadata = getMediumMetadata(res.content)
    const extractedTags: Element[] = extractTagsFromHTML(res.content, metadata)
    
    //console.log('metadata', metadata)

    const article = { pages: paginateElements(extractedTags, metadata), url, metadata } // character limit

    return article
}

// Attempts to pull out only the relevant content from the HTML - paragraph, heading, and image tags, stripped of attributes
function extractTagsFromHTML(html: string, metadata:MediumMetadata): Element[] {

    const parser = new DOMParser()

    // Use the DOMParser to turn the HTML string into a Document
    const doc = parser.parseFromString(html, 'text/html')

    // Get the relevant child elements from the article tag
    const article = doc.body.querySelector('article')
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
            if (width < 300 || alt === 'Top highlight' || alt === metadata.author || ( src && metadata.image && getFilenameFromUrl(src) == getFilenameFromUrl(metadata.image))) {
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
    const cleanedElements: Element[] = elementsArray.map(e => {
        return {
            tag: e.tagName,
            text: e.textContent?.trim() || '',
            src: e.getAttribute('src') || ''
        }
    })

    return cleanedElements

}

// Function to estimate the number of chars per line for each element based on its type
function estimateElementCharsAndLines(element: Element): number {
    const linesPerType:any = {
        'p': 80,
        'h1': 40,
        'h2': 60,
        'h3': 70,
        'h4': 70,
        'h5': 70,
        'other': 80
    }

    return linesPerType[element.tag] || linesPerType['other']
}

function paginateElements(elements: Element[], metadata: MediumMetadata): Page[] {
    
    // ignore elements if their text is equal to certain keywords including author, 'Follow', 'Listen', 'Share', or just a number
    const filteredElements = elements.filter(element => {
        const text = element.text.trim()
        // biome-ignore lint/complexity: <explanation>
        return ![
            'Follow', 'Listen', 'Share', metadata.author, metadata.title, 'About', 'Contact', 'Subscribe', 'Top highlight'
        ].includes(text) && 
        !text.match(/^\d+(\.\d+)?[KMB]?$/)
    })

    // Split elements that are too long
    const chunkedElements: Element[] = filteredElements.reduce((acc: Element[], currentElement) => {
        const charsPerLine = estimateElementCharsAndLines(currentElement)
        const charsPerPage = charsPerLine * 24 // 24 lines per page
        if (currentElement.text.length > charsPerPage) {
            const newElements: Element[] = splitElement(currentElement, charsPerPage)
            acc.push(...newElements)
        } else {
            acc.push(currentElement)
        }
        return acc
    }, [])

    const pages: Page[] = []
    let currentPage: Page = []
    let currentPageLinesRemaining = 24 // 24 lines per page

    for (const currentElement of chunkedElements) {
        const currentElementEstimatedCharsPerLine = estimateElementCharsAndLines(currentElement)        
        const currentElementLinesRequired = currentElement.src
            ? 15 // images take up 15 lines
            : (currentElement.text.length / currentElementEstimatedCharsPerLine) + 2
    
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
function splitElement(element: Element, charLimit: number): Element[] {
    const { text } = element

    let currentLength = 0
    const newElements: Element[] = []
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
function getMediumMetadata(htmlContent: string): MediumMetadata {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    // Initialize metadata object
    const metadata: MediumMetadata = {
        authorUrl: null,
        author: null,
        title: null,
        image: null,
    }

    // Extract metadata from meta tags
    const metaTags = tempDiv.querySelectorAll('meta[data-rh="true"]')
    for (const tag of metaTags) {
        const property = tag.getAttribute('property')
        const name = tag.getAttribute('name')
        const content = tag.getAttribute('content')

        if (property === 'article:author') {
            metadata.authorUrl = content
        } else if (name === 'author') {
            metadata.author = content
        } else if (property === 'og:title') {
            metadata.title = content
        } else if (property === 'og:image') {
            metadata.image = content
        }
    }

    return metadata
}

// Helper function to extract the filename from a URL
function getFilenameFromUrl(url:string) {
    if (!url) return '';
    return url.substring(url.lastIndexOf('/') + 1);
}

export default getMediumArticle