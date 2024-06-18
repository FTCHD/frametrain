interface FramePressConfig {
    figmaPAT: string
    slides: SlideConfig[]
    nextSlideId: number
}

type AspectRatio = '1.91:1' | '1:1'

type SlideConfig = {
    id: string
    aspectRatio: AspectRatio
    title?: string
    figmaUrl?: string
    description?: string
    textLayers: TextLayerConfigs
    buttons: ButtonConfig[]
}

type TextLayerConfigs = Record<string, TextLayerConfig>

type TextLayerConfig = {
    id: string
    enabled: boolean
    fill: string
    stroke: string
    fontFamily: string
    fontSize: number
    fontWeight: string
    fontStyle: string
    letterSpacing: string
    style: string
    centerHorizontally?: boolean
    x: number
    y: number
    contentOverride?: string
}

type ButtonConfig = {
    id: string
    enabled: boolean
    caption: string
    target: string
    link?: string
}

export type {
    FramePressConfig,
    TextLayerConfigs,
    TextLayerConfig,
    ButtonConfig,
    AspectRatio,
    SlideConfig,
}
