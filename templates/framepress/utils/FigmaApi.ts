/*

    This code is an almost exact port to TS of experimental_FigmaImageResponse()
    from @vercel/og/dist/index.node.js

    It adds user-friendly error messages, but it should be rewritten to use a proper 
    XML parser instead of regex.

*/

type Result<T> = { success: true; value: T } | { success: false; error: string }

export type FigmaDesign = {
    width: number
    height: number
    aspectRatio?: number
    textLayers: FigmaTextLayer[]
    base64: string
}

type FigmaTextLayer = {
    id: string
    fill: string
    stroke: string
    fontFamily: string
    fontSize: number
    fontWeight: string
    fontStyle: string
    letterSpacing: string
    style: string
    x: number
    y: number
    content: string
}

export async function getFigmaDesign(figmaPAT: string, url?: string): Promise<Result<FigmaDesign>> {
    if (!figmaPAT) {
        return { success: false, error: 'Personal Access Token (PAT) is missing or empty' }
    }

    const { fileId, nodeId } = parseFigmaUrl(url)
    if (!(fileId && nodeId)) {
        return { success: false, error: 'Not a valid Figma URL' }
    }

    try {
        const figmaResponse = await fetch(
            `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&svg_outline_text=false&format=svg&svg_include_id=true`,
            {
                method: 'GET',
                headers: {
                    'X-FIGMA-TOKEN': figmaPAT,
                },
                cache: 'no-store',
            }
        )

        if (!figmaResponse.ok) {
            return { success: false, error: `Figma API error: ${figmaResponse.statusText}` }
        }

        const figmaResponseJson = await figmaResponse.json()
        const svgDownloadPath = figmaResponseJson.images[nodeId.replace('-', ':')]

        if (!svgDownloadPath) {
            return { success: false, error: 'Figma API failed to return an SVG download path' }
        }

        const svgResponse = await fetch(svgDownloadPath, { cache: 'no-store' })

        if (!svgResponse.ok) {
            return { success: false, error: `Failed to download SVG: ${svgResponse.statusText}` }
        }

        const svg = await svgResponse.text()
        const { width, height } = getSvgDimensions(svg)

        if (width === 0 || height === 0) {
            return { success: false, error: 'Failed to extract dimensions from SVG' }
        }

        const textNodes = getTextNodes(svg)
        const textLayers = textNodes.map(parseSvgText)
        const base64 = svgToBase64(svg)
        const aspectRatio = width / height

        return {
            success: true,
            value: {
                width: width,
                height: height,
                aspectRatio: aspectRatio,
                textLayers: textLayers,
                base64: base64,
            },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`
        return { success: false, error: `Network or unknown error: ${message}` }
    }
}

function svgToBase64(svg: any) {
    const base64 = Buffer.from(svg).toString('base64')
    return 'data:image/svg+xml;base64,' + base64
}

function getSvgDimensions(svg: any) {
    const widthMatch = svg.match(/width="(\d+)/)
    const heightMatch = svg.match(/height="(\d+)/)
    if (widthMatch && heightMatch) {
        const width = Number.parseInt(widthMatch[1], 10)
        const height = Number.parseInt(heightMatch[1], 10)
        return { width, height }
    }
    return { width: 0, height: 0 }
}

function getTextNodes(svg: any) {
    const regex = /<text[^>]*>(.*?)<\/text>/g
    let match
    const matches = []
    while ((match = regex.exec(svg)) !== null) {
        matches.push(match[0])
    }
    return matches
}

function parseSvgText(svgText: any): FigmaTextLayer {
    const id = svgText.match(/id="([^"]*)"/)?.[1] || ''
    const fill = svgText.match(/fill="([^"]*)"/)?.[1] || ''
    const stroke = svgText.match(/stroke="([^"]*)"/)?.[1] || ''
    const fontFamily = svgText.match(/font-family="([^"]*)"/)?.[1] || ''
    const fontSize = svgText.match(/font-size="([^"]*)"/)?.[1] || ''
    const fontWeight = svgText.match(/font-weight="([^"]*)"/)?.[1] || ''
    const fontStyle = svgText.match(/font-style="([^"]*)"/)?.[1] || ''
    const letterSpacing = svgText.match(/letter-spacing="([^"]*)"/)?.[1] || ''
    const style = svgText.match(/style="([^"]*)"/)?.[1] || ''
    const x = svgText.match(/<tspan[^>]*x="([^"]*)"/)?.[1] || ''
    const y = svgText.match(/<tspan[^>]*y="([^"]*)"/)?.[1] || ''
    const content = svgText.match(/<tspan[^>]*>([^<]*)<\/tspan>/)?.[1] || ''

    return {
        id,
        fill,
        stroke,
        fontFamily,
        fontSize: Number.parseInt(fontSize),
        fontWeight,
        fontStyle,
        letterSpacing,
        style,
        x: Number.parseInt(x),
        y: Number.parseInt(y),
        content,
    }
}

function parseFigmaUrl(figmaUrl?: string) {
    const regex = /\/design\/([^\/]+)\/[^?]+\?[^#]*node-id=([^&#]+)/
    const match = figmaUrl?.match(regex)
    let fileId = ''
    let nodeId = ''
    if (match) {
        fileId = match[1] || ''
        nodeId = match[2] || ''
    }
    return { fileId, nodeId }
}
