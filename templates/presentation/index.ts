import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export type PresentationType = 'text' | 'image'
export type BackgroundType = 'color' | 'gradient' | 'image'

interface TextConfig extends BaseConfig {
    type: PresentationType
    background: {
        type: BackgroundType
        value: string
    }
    title?: {
        text: string
        font: string
        color: string
        style: string
        weight: string
    }
    content?: {
        text: string[]
        font: string
        color: string
        weight: string
        align: 'left' | 'center' | 'right'
    }
}

interface ImageConfig extends BaseConfig {
    type: PresentationType
    aspect: '1:1' | '1.91:1'
    images: string[]
}

export type Config<T extends PresentationType = 'text' | 'image'> = T extends 'text'
    ? TextConfig
    : T extends 'image'
      ? ImageConfig
      : TextConfig | ImageConfig

export interface State extends BaseState {}

export default {
    name: 'Presentation Template',
    description: 'Turn your images and long texts into a slideshow.',
    creatorFid: '661506',
    creatorName: 'oynozan',
    cover,
    enabled: true,
    Inspector,
    functions,
    requiresValidation: false,
} satisfies BaseTemplate
