'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import FigmaView from '../views/FigmaView'
import type { FramePressConfig, SlideConfig } from '../Config'
import { getFigmaDesign, getFigmaSvgImage } from '../utils/FigmaApi'
import type { FontStyle, FontWeight } from 'satori'
import type { FrameActionPayload } from 'frames.js'
import { FrameError } from '@/sdk/handlers'

export default async function buildFrame(
    config: FramePressConfig,
    slideConfig?: SlideConfig,
    body?: FrameActionPayload
): Promise<BuildFrameData> {
    if (!config.figmaPAT) {
        throw new FrameError('Please configure your Figma Personal Access Token')
    }

    if (!slideConfig) {
        throw new FrameError('This is no longer a valid slide, reconfigure the button')
    }

    if (!slideConfig.figmaUrl) {
        throw new FrameError('Please configure the Figma URL for this slide')
    }

    const svgImage = await getFigmaSvgImage(config.figmaPAT, slideConfig.figmaUrl)

    if (!svgImage.success) {
        throw new FrameError(svgImage.error)
    }

    const view = FigmaView(slideConfig, svgImage.value)

    // We need to merge the fonts in the design with the fonts in the config
    // (fonts in the design may be missing from the config if the Figma was
    // updated without updating the config in the Inspector)

    const fontsInDesign = Object.values(svgImage.value.textNodes).map(
        (textLayer) =>
            new FontConfig(textLayer.fontFamily, textLayer.fontWeight, textLayer.fontStyle)
    )

    const fontsInConfig = Object.values(slideConfig.textLayers).map(
        (textLayerConfig) =>
            new FontConfig(
                textLayerConfig.fontFamily,
                textLayerConfig.fontWeight,
                textLayerConfig.fontStyle
            )
    )

    const combinedFonts = [...fontsInDesign, ...fontsInConfig]
    const distinctFontKeys = Array.from(new Set(combinedFonts.map((font) => font.key)))
    const distinctFonts = distinctFontKeys
        .map((key) => combinedFonts.find((font) => font.key === key))
        .filter((font): font is FontConfig => font !== undefined)
    const fontPromises = distinctFonts.map(({ fontFamily, fontWeight, fontStyle }) => {
        console.debug(`Loading font ${fontFamily} ${fontWeight} ${fontStyle}`)
        return loadGoogleFontV2(fontFamily, fontWeight, fontStyle)
    })
    const fonts = await Promise.all(fontPromises)

    const buttons = slideConfig?.buttons
        .filter((button) => button.enabled)
        .map((button) => ({
            label: button.caption,
        }))

    return {
        buttons: buttons || [],
        fonts,
        aspectRatio: slideConfig.aspectRatio,
        component: view,
        functionName: 'slide',
        params: { origin: slideConfig.id },
    }
}

class FontConfig {
    fontFamily: string
    fontWeight: FontWeight
    fontStyle: FontStyle
    key: string

    constructor(fontFamily: string, fontWeight: string, fontStyle: string) {
        this.fontFamily = fontFamily
        this.fontWeight = this.mapFontWeight(fontWeight)
        this.fontStyle = (fontStyle as FontStyle) || 'normal'
        this.key = `${this.fontFamily}::${this.fontWeight}:${this.fontStyle}`
    }

    private mapFontWeight(fontWeight: string): FontWeight {
        const weightMap: { [key: string]: FontWeight } = {
            'normal': 400,
            'bold': 700,
            'bolder': 900,
            'lighter': 100,
            '100': 100,
            '200': 200,
            '300': 300,
            '400': 400,
            '500': 500,
            '600': 600,
            '700': 700,
            '800': 800,
            '900': 900,
            'thin': 100,
            'extra-light': 200,
            'light': 300,
            'regular': 400,
            'medium': 500,
            'semi-bold': 600,
            'extra-bold': 800,
            'black': 900,
            'heavy': 900,
        }
        return weightMap[fontWeight] || 400 // Default to 400 if not found
    }
}

// REVIEW loadGoogleFont() in the FT SDK don't work right; this should probably replace it
export async function loadGoogleFontV2(
    fontName: string,
    fontWeight: FontWeight,
    fontStyle: FontStyle
): Promise<{ name: string; data: ArrayBuffer; weight: FontWeight; style: FontStyle }> {
    const requestFontName = fontName.replace(' ', '+')
    const fontWeightValue = fontWeight as number
    const italicValue = fontStyle === 'italic' ? '1' : '0'

    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${requestFontName}:ital,wght@${italicValue},${fontWeightValue}&display=swap`

    const response = await fetch(googleFontUrl)
    const cssText = await response.text()

    // Extract the font URL from the CSS text
    const fontUrlMatch = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/.*?)\)/)
    if (!fontUrlMatch) {
        throw new Error('Failed to extract font URL from CSS')
    }

    const fontUrl = fontUrlMatch[1]

    // Download the font file
    const fontResponse = await fetch(fontUrl)
    const fontArrayBuffer = await fontResponse.arrayBuffer()

    return {
        name: fontName,
        data: fontArrayBuffer,
        weight: fontWeight,
        style: fontStyle,
    }
}
