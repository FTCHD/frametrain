'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFont } from '@/sdk/fonts'
import type { FramePressConfig, SlideConfig } from '../Config'
import { FigmaView, NoFigmaView } from '../views/FigmaView'
import FontConfig from './FontConfig'

export default async function buildFigmaFrame(
    config: FramePressConfig,
    slideConfig?: SlideConfig
): Promise<BuildFrameData> {
    if (!config.figmaPAT) {
        throw new FrameError('Please configure your Figma Personal Access Token')
    }

    if (!slideConfig) {
        throw new FrameError('This is no longer a valid slide, reconfigure the button')
    }

    const view = slideConfig.figmaUrl ? FigmaView({ slideConfig }) : NoFigmaView()

    // We need to merge the fonts in the design with the fonts in the config
    // (fonts in the design may be missing from the config if the Figma was
    // updated without updating the config in the Inspector)
    const fallbackFont = new FontConfig('Inter', '400', 'Normal')

    const fontsUsed = [
        fallbackFont,
        ...Object.values(slideConfig.textLayers).map(
            (textLayerConfig) =>
                new FontConfig(
                    textLayerConfig.fontFamily,
                    textLayerConfig.fontWeight,
                    textLayerConfig.fontStyle
                )
        )
    ]

    const distinctFontKeys = Array.from(new Set(fontsUsed.map((font) => font.key)))
    const distinctFonts = distinctFontKeys
        .map((key) => fontsUsed.find((font) => font.key === key))
        .filter((font): font is FontConfig => font !== undefined)
    const fontPromises = distinctFonts.map(async ({ fontFamily, fontWeight, fontStyle }) => {
        const result = await loadGoogleFont(fontFamily, fontWeight, fontStyle)
        return result
    })

    // We use allSettled so that font loads don't crash the frame
    const fontResults = await Promise.allSettled(fontPromises)
    const fonts = fontResults.filter((r) => r.status == 'fulfilled').map((r) => r.value)

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
        handler: 'click',
        params: { origin: slideConfig.id },
    }
}
