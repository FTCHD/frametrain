import type { FigmaTextLayer } from './utils/FigmaApi'

export interface FramePressConfig {
    figmaPAT: string
    slides: SlideConfig[]
    nextSlideId: number
}

export type AspectRatio = '1.91:1' | '1:1'

export type SlideConfig = {
    id: string
    aspectRatio: AspectRatio
    title?: string
    description?: string
    figmaUrl?: string
    figmaMetadata?: FigmaMetadata
    baseImagePaths: BaseImagePaths
    textLayers: TextLayerConfigs
    buttons: ButtonConfig[]
}

export type BaseImagePaths = Record<AspectRatio, string>

export type TextLayerConfigs = Record<string, TextLayerConfig>

export type TextLayerConfig = FigmaTextLayer & {
    allowFigmaUpdates: boolean
    enabled: boolean
}

export type ButtonConfig = {
    id: string
    enabled: boolean
    caption: string
    target: string
    link?: string
}

/**
 * Keeps track of the Figma metadata as of the last time
 * the Figma file was retrieved.
 */
export type FigmaMetadata = {
    name: string
    lastModified: string
    width: number
    height: number
    aspectRatio: number
}
