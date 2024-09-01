import type { BaseConfig, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export type BackgroundType = 'color' | 'gradient' | 'image'
export type CustomButtonType = 'navigate' | 'link' | 'mint'
export type CustomButtons = Array<{
    type: CustomButtonType
    label: string
    target: string
}>
export interface Slide {
    type: 'text' | 'image'
    aspectRatio: '1:1' | '1.91:1'
    objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
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
    buttons: CustomButtons
}

export interface Config extends BaseConfig {
    slides: Slide[]
}

const DEFAULT_SLIDE: Slide = {
    type: 'text',
    aspectRatio: '1:1',
    objectFit: 'cover',
    background: {
        type: 'color',
        value: 'linear-gradient(245deg, rgb(252,136,0), rgb(252,0,162))',
    },
    title: {
        text: '',
        color: '#1c1c1c',
        weight: '700',
        font: 'Inter',
        style: 'normal',
    },
    content: {
        text: '',
        color: '#000000',
        font: 'Roboto',
        align: 'left',
        weight: '400',
    },
    buttons: [
        {
            type: 'navigate',
            label: 'Navigate',
            target: '1',
        },
    ],
}

export const PRESENTATION_DEFAULTS: Config = {
    slides: [DEFAULT_SLIDE],
}

export default {
    name: 'Presentation',
    description: 'Turn images and long texts into powerful slideshows.',
    shortDescription: 'Remember Powerpoint?',
    octicon: 'versions',
    creatorFid: '661506',
    creatorName: 'oynozan',
    cover,
    initialConfig: PRESENTATION_DEFAULTS,
    enabled: true,
    Inspector,
    handlers,
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
