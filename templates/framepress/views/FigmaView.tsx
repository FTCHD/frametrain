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

    const horzAlignmentToCss = (alignment: TextAlignHorizontal): string => {
        switch (alignment) {
            case 'LEFT':
                return 'flex-start'
            case 'CENTER':
                return 'center'
            case 'RIGHT':
                return 'flex-end'
            default:
                return 'flex-start'
        }
    }

    const vertAlignmentToCss = (alignment: TextAlignVertical): string => {
        switch (alignment) {
            case 'TOP':
                return 'flex-start'
            case 'CENTER':
                return 'center'
            case 'BOTTOM':
                return 'flex-end'
            default:
                return 'flex-start'
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
                    const horzAlignment = horzAlignmentToCss(config?.textAlignHorizontal)
                    const vertAlignment = vertAlignmentToCss(config?.textAlignVertical)
                    const x = config.boundsX
                    const y = config.boundsY
                    const width = config.boundsWidth
                    const height = config.boundsHeight

                    // Allow the user to backout of the override by saving empty content
                    const content =
                        config?.content && config.content.length > 0 ? config.content : svg.content

                    // TODO support centered text
                    return (
                        <div
                            key={svg.id}
                            style={{
                                position: 'absolute',
                                display: 'flex',
                                justifyContent: horzAlignment,
                                alignItems: vertAlignment,
                                left: `${x}px`,
                                top: `${y}px`,
                                width: `${width}px`,
                                height: `${height}px`,

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
