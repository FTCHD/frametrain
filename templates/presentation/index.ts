import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export type BackgroundType = 'color' | 'gradient' | 'image'

export interface Slide {
    aspect: '1:1' | '1.91:1'
    background: {
        type: BackgroundType
        value: string
    }
    image?: string
    title?: {
        text: string
        font: string
        color: string
        style: string
        weight: string
    }
    content?: {
        text: string
        font: string
        color: string
        weight: string
        align: 'left' | 'center' | 'right'
    }
}

export interface Config extends BaseConfig {
    slides: Slide[]
}

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
