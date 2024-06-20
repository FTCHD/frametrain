import type { FigmaSvgImage } from '../utils/FigmaApi'
import type { HorizontalAlignment, SlideConfig, VerticalAlignment } from '../Config'
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
export default function FigmaView(slideConfig: SlideConfig, figmaDesign: FigmaSvgImage) {
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

    const horzAlignmentToCss = (alignment: HorizontalAlignment): string => {
        switch (alignment) {
            case 'left':
                return 'flex-start'
            case 'center':
                return 'center'
            case 'right':
                return 'flex-end'
            default:
                return 'flex-start'
        }
    }

    const vertAlignmentToCss = (alignment: VerticalAlignment): string => {
        switch (alignment) {
            case 'top':
                return 'flex-start'
            case 'middle':
                return 'center'
            case 'bottom':
                return 'flex-end'
            default:
                return 'flex-start'
        }
    }

    return (
        <div style={{ display: 'flex' }}>
            <img
                style={{ position: 'absolute' }}
                alt="Figma Design"
                width={figmaDesign.width}
                height={figmaDesign.height}
                src={figmaDesign.base64}
            />
            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                }}
            >
                {figmaDesign.textNodes.map((textLayer) => {
                    // If the figma design was modified after configuration,
                    // we will not find a layer config. We could give an error,
                    // but that seems unfriendly, instead we fallback to the layer.
                    const textLayerConfig = slideConfig.textLayers[textLayer.id]
                    const fill = textLayerConfig?.fill || textLayer.fill
                    const stroke = textLayerConfig?.stroke || textLayer.stroke
                    const fontFamily = textLayerConfig?.fontFamily || textLayer.fontFamily
                    const fontSize = textLayerConfig?.fontSize || textLayer.fontSize
                    const fontWeight = textLayerConfig?.fontWeight || textLayer.fontWeight
                    const fontStyle = textLayerConfig?.fontStyle || textLayer.fontStyle
                    const letterSpacing = textLayerConfig?.letterSpacing || textLayer.letterSpacing
                    const css = parseCSS(textLayerConfig?.css || textLayer.style)
                    const horzAlignment = horzAlignmentToCss(textLayerConfig?.horzAlignment || '')
                    const vertAlignment = vertAlignmentToCss(textLayerConfig?.vertAlignment || '')
                    const x = textLayerConfig.boundsX
                    const y = textLayerConfig.boundsY
                    const width = textLayerConfig.boundsWidth
                    const height = textLayerConfig.boundsHeight

                    // Allow the user to backout of the override by saving empty content
                    const content =
                        textLayerConfig?.contentOverride &&
                        textLayerConfig.contentOverride.length > 0
                            ? textLayerConfig.contentOverride
                            : textLayer.content

                    // TODO support centered text
                    return (
                        <div
                            key={textLayer.id}
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
