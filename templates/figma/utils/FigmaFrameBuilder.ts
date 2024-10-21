'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFont } from '@/sdk/fonts'
import type { ReactElement } from 'react'
import type { FramePressConfig, SlideConfig } from '../Config'
import { FigmaView, NoFigmaView } from '../views/FigmaView'
import FontConfig from './FontConfig'

export default async function buildFigmaFrame(
    config: FramePressConfig,
    slideConfig?: SlideConfig
): Promise<BuildFrameData> {
    // Used for messages and as a fallback
    const defaultFont = new FontConfig('Inter', '400', 'normal')

    // To support user friendly previews, we fail soft (no FrameError) here
    const [view, viewFonts] = createView()

    // We need to merge the fonts in the design with the fonts in the config
    // (fonts in the design may be missing from the config if the Figma was
    // updated without updating the config in the Inspector)
    const fonts = await loadFonts([defaultFont, ...viewFonts])

    const buttons = slideConfig?.buttons
        .filter((button) => button.enabled)
        .map((button) => {
            const caption =
                !button.caption || button.caption.length == 0 ? '(no label)' : button.caption

            if (button.target == 'URL') {
                return {
                    label: caption,
                    action: 'link',
                    target: button.link,
                } as FrameButtonMetadata
            }

            return {
                label: caption,
            } as FrameButtonMetadata
        })

    return {
        buttons: buttons || [],
        fonts,
        aspectRatio: slideConfig?.aspectRatio ?? '1:1',
        component: view,
        handler: 'click',
        params: slideConfig ? { origin: slideConfig.id } : null,
    }

    function createView(): [ReactElement, FontConfig[]] {
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: horrible advice
        if (!slideConfig || !slideConfig.figmaUrl)
            return [NoFigmaView(), []]

        const view = FigmaView({ slideConfig })
        const viewFonts = Object.values(slideConfig.textLayers).map(
            (textLayerConfig) =>
                new FontConfig(
                    textLayerConfig.fontFamily,
                    textLayerConfig.fontWeight,
                    textLayerConfig.fontStyle
                )
        )

        return [view, viewFonts]
    }

    async function loadFonts(fontConfigs: FontConfig[]) {
        const distinctFontKeys = new Set(fontConfigs.map((font) => font.key))

        const distinctFonts = Array.from(distinctFontKeys)
            .map((key) => fontConfigs.find((font) => font.key === key))
            .filter((font): font is FontConfig => font !== undefined)

        const fontPromises = distinctFonts.map(async ({ fontFamily, fontWeight, fontStyle }) => {
            const result = await loadGoogleFont(fontFamily, fontWeight, fontStyle)
            return result
        })

        // We use allSettled so that font loads don't crash the frame
        const fontResults = await Promise.allSettled(fontPromises)
        const fonts = fontResults.filter((r) => r.status === 'fulfilled').map((r) => r.value)

        return fonts
    }
}
