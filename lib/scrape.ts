'use server'
import { Readability } from '@mozilla/readability'
import { unstable_noStore as noStore } from 'next/cache'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { Parser } from 'htmlparser2';

function htmlToMarkdown(html: string, url: string) {
    noStore()

	const parser = new Parser({
		onopentag(name, attributes) {
		  // Handle opening tags if needed
		},
		ontext(text) {
		  // Handle text content if needed
		},
		onclosetag(tagname) {
		  // Handle closing tags if needed
		},
	  }, {
		decodeEntities: true,
	  });
	  
	  parser.write(html);
	  parser.end();
	  
	  
	const doc = parser.dom
	
    const article = new Readability(doc, url).parse()
    // return article!
	
	console.log('PARSED', doc)

    const content = NodeHtmlMarkdown.translate(article?.content || '', {})

    return { ...article, content }
}

async function renderWebpage(url: string) {
    noStore()

    const input = {
        gotoOptions: { waitUntil: 'networkidle2' },
        url,
    }

    const res = await fetch(
        `${process.env.BROWSERLESS_URL}/chrome/content?token=${process.env.BROWSERLESS_TOKEN}`,
        {
            cache: 'no-store',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }
    )
    const html = await res.text()

    return html
}

export async function parseWebpage(url: string) {
    noStore()

    try {
        const html = await renderWebpage(url)

        const article = htmlToMarkdown(html, url)

        return { content: article.content, title: article?.title, url, website: article?.siteName }
    } catch (error) {
        console.error(error)
        return { content: '抓取失败', errorMessage: (error as any).message, url }
    }
}

