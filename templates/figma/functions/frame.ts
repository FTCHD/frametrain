'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFont } from '@/sdk/fonts'
import type { FontStyle, FontWeight } from 'satori'
import type { FramePressConfig, SlideConfig } from '../Config'
import { FigmaView } from '../views/FigmaView'

export default async function buildFrame(
    config: FramePressConfig,
    slideConfig?: SlideConfig
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

    const view = FigmaView({ slideConfig })

    // We need to merge the fonts in the design with the fonts in the config
    // (fonts in the design may be missing from the config if the Figma was
    // updated without updating the config in the Inspector)
    const fontsUsed = Object.values(slideConfig.textLayers).map(
        (textLayerConfig) =>
            new FontConfig(
                textLayerConfig.fontFamily,
                textLayerConfig.fontWeight,
                textLayerConfig.fontStyle
            )
    )

    const distinctFontKeys = Array.from(new Set(fontsUsed.map((font) => font.key)))
    const distinctFonts = distinctFontKeys
        .map((key) => fontsUsed.find((font) => font.key === key))
        .filter((font): font is FontConfig => font !== undefined)
    const fontPromises = distinctFonts.map(async ({ fontFamily, fontWeight, fontStyle }) => {
        const result = await loadGoogleFont(fontFamily, fontWeight, fontStyle)
        return result
    })
    const fonts = await Promise.all(fontPromises)

    const buttons = slideConfig?.buttons
        .filter((button) => button.enabled)
        .map((button) => {
            if (button.target == 'URL') {
                return {
                    label: button.caption,
                    action: 'link',
                    target: button.link,
                } as FrameButtonMetadata
            }

            return {
                label: button.caption,
            } as FrameButtonMetadata
        })

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
