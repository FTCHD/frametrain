/*

This code is an almost exact port to TS of experimental_FigmaImageResponse()
from @vercel/og/dist/index.node.js

IMO it should be rewritten to use a proper XML parser.

*/

export type FigmaDesign = {
    width: number
    height: number
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

export async function getFigmaDesign(figmaPAT: string, url: string): Promise<FigmaDesign> {
    const { fileId, nodeId } = parseFigmaUrl(url)
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
    const figmaResponseJson = await figmaResponse.json()
    const svgDownloadPath = figmaResponseJson.images[nodeId.replace('-', ':')]
    const svgResponse = await fetch(svgDownloadPath, { cache: 'no-store' })
    const svg = await svgResponse.text()
    const { width, height } = getSvgDimensions(svg)
    const textNodes = getTextNodes(svg)
    const textLayers = textNodes.map(parseSvgText)
    const base64 = svgToBase64(svg)

    return {
        width: width,
        height: height,
        textLayers: textLayers,
        base64: base64,
    }
}

const isComplexTemplate = (template: any) => {
    return typeof template !== 'string' && template !== void 0 && 'value' in template
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
function parseFigmaUrl(figmaUrl: string) {
    const regex = /\/design\/([^\/]+)\/[^?]+\?[^#]*node-id=([^&#]+)/
    const match = figmaUrl.match(regex)
    let fileId = ''
    let nodeId = ''
    if (match) {
        fileId = match[1] || ''
        nodeId = match[2] || ''
    }
    return { fileId, nodeId }
}
