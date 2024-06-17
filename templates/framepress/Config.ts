interface FramePressConfig {
    figmaPAT: string
    slides: SlideConfig[]
    nextSlideId: number
}

type SlideConfig = {
    id: string
    title?: string
    figmaUrl?: string
    aspectRatio?: '1.91:1' | '1:1'
    description?: string
    textLayers: Record<string, TextLayerConfig>
    buttons: ButtonConfig[]
}

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

export type { FramePressConfig, TextLayerConfig, ButtonConfig, SlideConfig }
