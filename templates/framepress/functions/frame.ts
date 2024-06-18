'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import FigmaView from '../views/FigmaView'
import type { FramePressConfig, SlideConfig } from '../Config'
import { getFigmaDesign } from '../utils/FigmaApi'
import ErrorView from '../views/ErrorView'
import type { FontStyle, FontWeight } from 'satori'
import type { FrameActionPayload } from 'frames.js'

export default async function buildFrame(
    config: FramePressConfig,
    slideConfig?: SlideConfig,
    body?: FrameActionPayload
): Promise<BuildFrameData> {
    // TODO this leaks information if the initial Frame later becomes misconfigured; we need a way to reliably determine this
    const isDebug = !body || body.untrustedData.castId.hash === '0xDebug'

    let errorView
    if (!config.figmaPAT) {
        errorView = ErrorView(isDebug, 'Please configure your Figma Personal Access Token')
    } else if (!slideConfig) {
        errorView = ErrorView(isDebug, 'This is no longer a valid slide, reconfigure the button')
    } else if (!slideConfig.figmaUrl) {
        errorView = ErrorView(isDebug, 'Please configure the Figma URL for this slide')
    } else {
        const figmaDesign = await getFigmaDesign(config.figmaPAT, slideConfig.figmaUrl)

        if (!figmaDesign.success) {
            errorView = ErrorView(isDebug, figmaDesign.error)
        } else {
            const view = FigmaView(slideConfig, figmaDesign.value)

            const fontsInDesign = Object.values(figmaDesign.value.textLayers).map(
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
    }

    const roboto = await loadGoogleFontV2('Roboto', 400, 'normal')
    return {
        buttons: [],
        fonts: [roboto],
        aspectRatio: '1:1',
        component: errorView,
        functionName: 'slide',
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
