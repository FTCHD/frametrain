import type { TextAlignHorizontal, TextAlignVertical } from '../utils/FigmaApi'
import type { AspectRatio, SlideConfig, TextLayerConfig } from '../Config'
import he from 'he'
import { dimensionsForRatio } from '@/sdk/constants'
import { FrameError } from '@/sdk/handlers'

/*

This code is an almost exact port to TSX of experimental_FigmaImageResponse()
from @vercel/og/dist/index.node.js

I didn't use the @vercel/og code for the following reasons:
1. It doesn't support introspection e.g. to extract text layer info
2. It doesn't support multi-line text fields (try it!)
3. It's not easy to debug due to the low-level implementation

This implementation is almost exactly the same as the @vercel/og code one, i.e.
it produces a parent <div> containing an <img> for all non-text SVG nodes,
and then a <div> containing transformed versions of the SVG text nodes.

*/

type FigmaViewProps = {
    slideConfig: SlideConfig
}

export function getDimensionsForAspectRatio(aspectRatio: AspectRatio) {
    return aspectRatio == '1.91:1'
        ? dimensionsForRatio['1.91/1']
        : aspectRatio == '1:1'
          ? dimensionsForRatio['1/1']
          : undefined
}

export function FigmaView({ slideConfig }: FigmaViewProps) {
    const parseCSS = (cssString: string): Record<string, string> => {
        if (!cssString) return {}

        return cssString.split('\n').reduce(
            (acc, style) => {
                if (style.trim()) {
                    const [property, value] = style.split(':')
                    acc[property.trim()] = value.trim()
                }
                return acc
            },
            {} as Record<string, string>
        )
    }

    const textAlignHorizontalToCss = (alignment: TextAlignHorizontal): string | undefined => {
        switch (alignment) {
            case 'LEFT':
                return 'flex-start'
            case 'CENTER':
                return 'center'
            case 'RIGHT':
                return 'flex-end'
            default:
                return undefined
        }
    }

    const textAlignVerticalToCss = (alignment: TextAlignVertical): string | undefined => {
        switch (alignment) {
            case 'TOP':
                return 'flex-start'
            case 'CENTER':
                return 'center'
            case 'BOTTOM':
                return 'flex-end'
            default:
                return undefined
        }
    }

    const baseImagePath = slideConfig.baseImagePaths?.[slideConfig.aspectRatio]
    if (!baseImagePath) return <></>

    const dimensions = getDimensionsForAspectRatio(slideConfig.aspectRatio)
    if (!dimensions) throw new FrameError('Unsupported aspect ratio')

    const baseImageUrl = process.env.NEXT_PUBLIC_CDN_HOST + '/frames/' + baseImagePath

    return (
        <div
            style={{
                display: 'flex',
                width: dimensions.width,
                height: dimensions.height,
            }}
        >
            <img src={baseImageUrl} alt={slideConfig.title} />
            {Object.values(slideConfig.textLayers).map(renderTextLayer)}
        </div>
    )

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: invalid
    function renderTextLayer(textLayer: TextLayerConfig) {
        if (!textLayer.enabled) return <></>

        const css = parseCSS(textLayer.cssStyle)

        // When no alignment is specified, we use the exact co-ordinates specified
        // in the SVG. This is a failsafe mode. In general, an alignment will be
        // provided, and we use CSS to align within the rendering bounds extacted
        // from the Figma file.
        const horizontalAlign = textAlignHorizontalToCss(textLayer?.textAlignHorizontal)
        const verticalAlign = textAlignVerticalToCss(textLayer?.textAlignVertical)

        const x = horizontalAlign ? textLayer.boundsX : textLayer.x
        // y is the text _baseline_ when no vert alignment is specified, but we
        // want the top y co-ordinate of the text block
        const y = verticalAlign ? textLayer.boundsY : textLayer.y - textLayer.fontSize

        // Width and height are actually only used when the corresponding alignment is specified
        const width = textLayer.boundsWidth
        const height = textLayer.boundsHeight

        // Allow the user to backout of the override by saving empty content
        const encodedContent =
            textLayer?.content && textLayer.content.length > 0
                ? textLayer.content
                : textLayer.content

        const content = he.decode(encodedContent)
        const contentLines = content.split('\n')

        return (
            <div
                key={textLayer.id}
                style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    ...(horizontalAlign ? { justifyContent: verticalAlign } : {}),
                    ...(verticalAlign ? { alignItems: horizontalAlign } : {}),
                    left: `${x}px`,
                    top: `${y}px`,
                    ...(horizontalAlign ? { width: `${width}px` } : {}),
                    ...(verticalAlign ? { height: `${height}px` } : {}),

                    color: textLayer.fill,
                    // Not currently supported by satori: https://github.com/vercel/satori/issues/578
                    WebkitTextStroke: textLayer.stroke,
                    fontSize: textLayer.fontSize,
                    fontWeight: textLayer.fontWeight || '400',
                    fontFamily: textLayer.fontFamily,
                    fontStyle: textLayer.fontStyle,
                    letterSpacing: textLayer.letterSpacing,
                    ...css,
                }}
            >
                {contentLines.map((line, index) => (
                    <div key={index}>{line == '' ? '\u00a0' : line}</div>
                ))}
            </div>
        )
    }
}
