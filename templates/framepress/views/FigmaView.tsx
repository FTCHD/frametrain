import type { FigmaSvgImage, TextAlignHorizontal, TextAlignVertical } from '../utils/FigmaApi'
import type { SlideConfig } from '../Config'
import he from 'he'

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
export default function FigmaView(slideConfig: SlideConfig, svgImage: FigmaSvgImage) {
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

    return (
        <div style={{ display: 'flex' }}>
            <img
                style={{ position: 'absolute' }}
                alt={slideConfig.title}
                width={svgImage.width}
                height={svgImage.height}
                src={svgImage.base64}
            />
            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                }}
            >
                {svgImage.textNodes.map((svg) => {
                    // If the figma design was modified after configuration,
                    // we will not find a layer config. We could give an error,
                    // but that seems unfriendly, instead we fallback to the layer.
                    const config = slideConfig.textLayers[svg.figmaNodeId]

                    const fill = config?.fill || svg.fill
                    const stroke = config?.stroke || svg.stroke
                    const fontFamily = config?.fontFamily || svg.fontFamily
                    const fontSize = config?.fontSize || svg.fontSize
                    const fontWeight = config?.fontWeight || svg.fontWeight
                    const fontStyle = config?.fontStyle || svg.fontStyle
                    const letterSpacing = config?.letterSpacing || svg.letterSpacing
                    const css = parseCSS(config?.cssStyle || svg.style)

                    // When no alignment is specified, we use the exact co-ordinates specified
                    // in the SVG. This is a failsafe mode. In general, an alignment will be
                    // provided, and we use CSS to align within the rendering bounds extacted
                    // from the Figma file.
                    const horizontalAlignment = textAlignHorizontalToCss(
                        config?.textAlignHorizontal
                    )
                    const verticalAlignment = textAlignVerticalToCss(config?.textAlignVertical)

                    const x = horizontalAlignment ? config.boundsX : config.x
                    // y is the text _baseline_ when no vert alignment is specified, but we
                    // want the top y co-ordinate of the text block
                    const y = verticalAlignment ? config.boundsY : config.y - fontSize

                    // Width and height are actually only used when the corresponding alignment is specified
                    const width = config.boundsWidth
                    const height = config.boundsHeight

                    // Allow the user to backout of the override by saving empty content
                    const content =
                        config?.content && config.content.length > 0 ? config.content : svg.content

                    return (
                        <div
                            key={svg.id}
                            style={{
                                position: 'absolute',
                                display: 'flex',
                                ...(horizontalAlignment
                                    ? { justifyContent: horizontalAlignment }
                                    : {}),
                                ...(verticalAlignment ? { alignItems: verticalAlignment } : {}),
                                left: `${x}px`,
                                top: `${y}px`,
                                ...(horizontalAlignment ? { width: `${width}px` } : {}),
                                ...(verticalAlignment ? { height: `${height}px` } : {}),

                                color: fill,
                                // Not currently supported by satori: https://github.com/vercel/satori/issues/578
                                WebkitTextStroke: stroke,
                                fontSize: fontSize,
                                fontWeight: fontWeight || '400',
                                fontFamily: fontFamily,
                                fontStyle: fontStyle,
                                letterSpacing: letterSpacing,
                                ...css,
                            }}
                        >
                            {he.decode(content)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
