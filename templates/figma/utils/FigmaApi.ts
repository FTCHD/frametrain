/*

    This code is based on experimental_FigmaImageResponse() from @vercel/og/dist/index.node.js.

    It adds several improvements, including enriching the SVG image export with data from the
    Figma file. It also adds user-friendly error messages, but it should be rewritten to use a 
    proper XML parser instead of regex.

*/

export type FigmaApiResult<T> = { success: true; value: T } | { success: false; error: string }

export type FigmaDesign = {
    name: string
    lastModified: string
    width: number
    height: number
    aspectRatio: number
    textLayers: FigmaTextLayer[]
    svgXml: string
    svgDataUrl: string
}

export type TextAlignHorizontal = undefined | 'LEFT' | 'CENTER' | 'RIGHT'
export type TextAlignVertical = undefined | 'TOP' | 'CENTER' | 'BOTTOM'

export type FigmaTextLayer = {
    id: string
    name: string
    fill: string
    stroke: string
    fontFamily: string
    fontSize: number
    fontWeight: string
    fontStyle: string
    letterSpacing: string
    lineHeightPx: number
    cssStyle: string
    textAlignHorizontal: TextAlignHorizontal
    textAlignVertical: TextAlignVertical
    x: number
    y: number
    width: number
    height: number
    boundsX: number
    boundsY: number
    boundsWidth: number
    boundsHeight: number
    content: string
}

export type FigmaSvgImage = {
    width: number
    height: number
    aspectRatio: number
    textNodes: FigmaSvgText[]
    xml: string
    dataUrl: string
}

export type FigmaSvgText = {
    id: string
    figmaNodeId: string
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

export type FigmaBoundingBox = {
    x: number
    y: number
    width: number
    height: number
}

export type FigmaNode = {
    id: string
    name: string
    type: string
    absoluteBoundingBox: FigmaBoundingBox
    children?: FigmaNode[]
}

export type FigmaStyle = {
    textAlignHorizontal: TextAlignHorizontal
    textAlignVertical: TextAlignVertical
    lineHeightPx: number
}

export type FigmaTextNode = {
    id: string
    name: string
    characters: string
    style: FigmaStyle
    relativeBoundingBox: FigmaBoundingBox
    absoluteBoundingBox: FigmaBoundingBox
    absoluteRenderBounds: FigmaBoundingBox
}

export type FigmaFile = {
    name: string
    lastModified: string
    document: FigmaNode
}

/**
 *
 * Fetches the Figma file and SVG image export, and merges them together into
 * a more useful structure we call a FigmaDesign.
 *
 */
export async function getFigmaDesign(
    figmaAccessToken: string,
    linkUrl?: string
): Promise<FigmaApiResult<FigmaDesign>> {
    try {
        const fileResult = await getFigmaFile(figmaAccessToken, linkUrl)
        if (!fileResult.success) return fileResult
        const file = fileResult.value

        const svgResult = await getFigmaSvgImage(figmaAccessToken, linkUrl)
        if (!svgResult.success) return svgResult
        const svg = svgResult.value

        // We need to merge the SVG text nodes with the Figma text nodes
        // because we need information from both node sources
        const figmaTextNodeLookup = computeRelativeTextNodes(file.document)
        const textLayers = svg.textNodes
            .map((svg) => {
                const figma = figmaTextNodeLookup[svg.figmaNodeId]
                return {
                    id: svg.figmaNodeId,
                    name: svg.id,
                    fill: svg.fill,
                    stroke: svg.stroke,
                    fontFamily: svg.fontFamily,
                    fontSize: svg.fontSize,
                    fontWeight: svg.fontWeight,
                    fontStyle: svg.fontStyle,
                    letterSpacing: svg.letterSpacing,
                    lineHeightPx: figma.style.lineHeightPx,
                    cssStyle: svg.style,
                    textAlignHorizontal: figma.style.textAlignHorizontal,
                    textAlignVertical: figma.style.textAlignVertical,
                    x: svg.x,
                    y: svg.y,
                    width: figma.absoluteRenderBounds.width,
                    height: figma.absoluteRenderBounds.height,
                    boundsX: figma.relativeBoundingBox.x,
                    boundsY: figma.relativeBoundingBox.y,
                    boundsWidth: figma.relativeBoundingBox.width,
                    boundsHeight: figma.relativeBoundingBox.height,
                    content: figma.characters,
                }
            })
            .sort((textLayer) => textLayer.y) // users generally want to see things in the visual order top to bottom

        const design = {
            name: file.name,
            lastModified: file.lastModified,
            width: svg.width,
            height: svg.height,
            aspectRatio: svg.aspectRatio,
            textLayers: textLayers,
            svgXml: svg.xml,
            svgDataUrl: svg.dataUrl,
        }

        return {
            success: true,
            value: design,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`
        return { success: false, error: `Unknown error: ${message}` }
    }

    function computeRelativeTextNodes(
        node: FigmaNode,
        rootBoundingBox?: FigmaBoundingBox
    ): Record<string, FigmaTextNode> {
        let result: Record<string, FigmaTextNode> = {}

        if (node.type === 'TEXT') {
            const textNode = node as unknown as FigmaTextNode
            const { x, y, width, height } = textNode.absoluteBoundingBox
            // Shouldn't be possible to have a top-level text node, but we handle it anyway
            result[node.id] = {
                id: node.id,
                name: node.name,
                characters: textNode.characters,
                style: textNode.style,
                absoluteBoundingBox: textNode.absoluteBoundingBox,
                absoluteRenderBounds: textNode.absoluteRenderBounds,
                relativeBoundingBox: {
                    x: x - (rootBoundingBox?.x || 0),
                    y: y - (rootBoundingBox?.y || 0),
                    width,
                    height,
                },
            }
        }

        if (node.children) {
            for (const child of node.children) {
                const childResult = computeRelativeTextNodes(
                    child,
                    rootBoundingBox ?? node.absoluteBoundingBox
                )
                result = { ...result, ...childResult }
            }
        }

        return result
    }
}

/**
 * See: https://www.figma.com/developers/api#get-files-endpoint
 */
export async function getFigmaFile(
    figmaAccessToken: string,
    linkUrl?: string
): Promise<FigmaApiResult<FigmaFile>> {
    try {
        if (!figmaAccessToken) {
            return { success: false, error: 'Personal Access Token (PAT) is missing or empty' }
        }

        const { fileId, nodeId } = parseFigmaUrl(linkUrl)
        if (!(fileId && nodeId)) {
            return { success: false, error: 'Not a valid Figma URL' }
        }

        const jsonFileResponse = await fetch(
            `https://api.figma.com/v1/files/${fileId}?ids=${nodeId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${figmaAccessToken}`,
                    'X-FIGMA-TOKEN': figmaAccessToken,
                },
                cache: 'no-store', // always get the latest
            }
        )

        if (!jsonFileResponse.ok) {
            return {
                success: false,
                error: `Figma JSON download failed: ${jsonFileResponse.statusText}`,
            }
        }

        const figmaFile = (await jsonFileResponse.json()) as FigmaFile

        return {
            success: true,
            value: figmaFile,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`
        return { success: false, error: `Network or unknown error: ${message}` }
    }
}

/**
 * See: https://www.figma.com/developers/api#get-images-endpoint
 */
export async function getFigmaSvgImage(
    figmaAccessToken: string,
    linkUrl?: string
): Promise<FigmaApiResult<FigmaSvgImage>> {
    try {
        if (!figmaAccessToken) {
            return { success: false, error: 'Personal Access Token (PAT) is missing or empty' }
        }

        const { fileId, nodeId } = parseFigmaUrl(linkUrl)
        if (!(fileId && nodeId)) {
            return { success: false, error: 'Not a valid Figma URL' }
        }

        const svgExportResponse = await fetch(
            `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&svg_outline_text=false&format=svg&svg_include_id=true&svg_include_node_id=true`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${figmaAccessToken}`,
                    'X-FIGMA-TOKEN': figmaAccessToken,
                },
                cache: 'no-store', // PERFORMANCE: think about how we can avoid this
            }
        )

        if (!svgExportResponse.ok) {
            return {
                success: false,
                error: `Figma SVG export failed: ${svgExportResponse.statusText}`,
            }
        }

        const svgExportObject = await svgExportResponse.json()

        const svgExportUrl = svgExportObject.images[nodeId.replace('-', ':')]
        if (!svgExportUrl) {
            return { success: false, error: 'Figma API failed to return an SVG download path' }
        }

        const svgResponse = await fetch(
            svgExportUrl,
            { cache: 'no-store' } // PERFORMANCE: think about how we can avoid this
        )

        if (!svgResponse.ok) {
            return { success: false, error: `Failed to download SVG: ${svgResponse.statusText}` }
        }

        const xml = await svgResponse.text()

        const { width, height } = getSvgDimensions(xml)

        if (width === 0 || height === 0) {
            return { success: false, error: 'Failed to extract dimensions from SVG' }
        }

        const svgTextNodes = getSvgTextNodes(xml)
        const textNodes = svgTextNodes.map(parseSvgText)
        const dataUrl = svgToDataUrl(xml)

        return {
            success: true,
            value: {
                width: width,
                height: height,
                aspectRatio: width / height,
                textNodes: textNodes,
                xml: xml,
                dataUrl: dataUrl,
            },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`
        return { success: false, error: `Network or unknown error: ${message}` }
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

    function getSvgTextNodes(svg: any) {
        const regex = /<text[^>]*>(.*?)<\/text>/g
        let match
        const matches = []
        while ((match = regex.exec(svg)) !== null) {
            matches.push(match[0])
        }
        return matches
    }

    function parseSvgText(svgText: any): FigmaSvgText {
        const id = svgText.match(/id="([^"]*)"/)?.[1] || ''
        const nodeId = svgText.match(/data-node-id="([^"]*)"/)?.[1] || ''
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
            figmaNodeId: nodeId,
            fill,
            stroke,
            fontFamily,
            fontWeight,
            fontStyle,
            fontSize: Number.parseInt(fontSize),
            letterSpacing,
            style,
            x: Number.parseInt(x),
            y: Number.parseInt(y),
            content,
        }
    }
}

/**
 * Converts an SVG to a data URL
 * @param svg
 * @returns Data URL
 */
export function svgToDataUrl(svg: any) {
    const base64 = Buffer.from(svg).toString('base64')
    return 'data:image/svg+xml;base64,' + base64
}

/**
 * See: https://www.figma.com/developers/api#files-endpoints
 * @param figmaUrl A Figma URL obtained via the "copy link" function
 * @returns fileId and nodeId
 */
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
