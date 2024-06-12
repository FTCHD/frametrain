import { scrape } from '@/sdk/scrape'

interface MediumMetadata {
    authorUrl: string | null
    author: string | null
    title: string | null
    image: string | null
}

// One tag and its contents
export type Element = {
    tag: string
    text: string
    nestedTags?: {position:number, tag:Element}[]
}

// A page will be made up of an array of elements
export type Page = Element[]

export type Article = {
    pages: Page[]
    url: string
    metadata: MediumMetadata
}

export async function getMediumArticle(url: string): Promise<Article> {
    
    console.log('scraping medium article', url)

    const res = await scrape({ url })

    const extractedText = extractTextFromMediumHTML(res.content)
    const metadata = getMediumMetadata(res.content)

    console.log(metadata)

    const article = { pages: paginateElements(extractedText, 1000, metadata), url, metadata } // character limit

    return article
}

// Attempts to pull out only the relevant content from the HTML
function extractTextFromMediumHTML(html: string): Element[] {
    // Create a new DOMParser
    const parser = new DOMParser()

    // Use the DOMParser to turn the HTML string into a Document
    const doc = parser.parseFromString(html, 'text/html')

    // Get the article element and its relevant child elements
    const article = doc.body.querySelector('article')
    const elements = article?.querySelectorAll('p, h1, h2, h3, h4, h5, h6')

    if (!elements) return []

    const elementsArray: HTMLElement[] = Array.from(elements) as HTMLElement[]

    // Helper function to extract nested tags such as <em>, <strong> etc., and remember their positions so they can be re-inserted later
    // biome-ignore lint/complexity: <explanation>
    function extractNestedTags(element: HTMLElement): { position: number, tag: Element }[] {
        const nestedTags: { position: number, tag: Element }[] = []
        let charIndex = 0
        
        for ( const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                charIndex += node.textContent?.length || 0
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const childElement = node as HTMLElement
                if (childElement.tagName === 'STRONG' || childElement.tagName === 'EM') {
                    nestedTags.push({
                        position: charIndex,
                        tag: {
                            tag: childElement.tagName,
                            text: childElement.textContent || ''
                        }
                    })
                    charIndex += childElement.textContent?.length || 0
                }
            }
        }
        return nestedTags
    }

    const cleanedElements: Element[] = elementsArray.map(e => {
        const nestedTags = extractNestedTags(e)
        return {
            tag: e.tagName,
            text: e.textContent || '',
            nestedTags: nestedTags.length > 0 ? nestedTags : undefined
        }
    })

    return cleanedElements
}


function paginateElements(elements: Array<{ tag: string, text: string }>, charLimit: number, metadata:MediumMetadata): Page[] {
    const pages: Page[] = []
    let currentPage: Page = []
    let currentCharCount = 0

    // ignore elements if their text is equal to certain keywords including the author, 'Follow', 'Listen', 'Share', or just a number
    const filteredElements = elements.filter(element => {
        const text = element.text.trim()
        // biome-ignore lint/complexity: <explanation>
        return !['Follow', 'Listen', 'Share', metadata.author, metadata.title, 'About', 'Contact', 'Subscribe', 'Top highlight'
        ].includes(text) && !text.match(/^\d+(\.\d+)?[KMB]?$/)
    })

    //console.log('filteredElements', filteredElements)

    for (const element of filteredElements) {
        const elementTextLength = element.text?.length ?? 0
    
        if (currentCharCount + elementTextLength <= charLimit) {
            currentPage.push(element)
            currentCharCount += elementTextLength
        } else {
            pages.push(currentPage)
            currentPage = [element]
            currentCharCount = elementTextLength
        }
    }

    if (currentPage.length > 0) {
        pages.push(currentPage)
    }

    return pages
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

export function createMediumPage(article: any, page: number) {
    console.log(page, article)
}

export default getMediumArticle