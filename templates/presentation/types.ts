import type { BaseConfig } from '@/lib/types'

export type BackgroundType = 'color' | 'gradient' | 'image'
export type CustomButtonType = 'navigate' | 'link' | 'mint'
export type CustomButtons = Array<{
    type: CustomButtonType
    text?: string
    link?: string
    nftID?: string
    slideID?: number
}>
export interface Slide {
    type: 'text' | 'image'
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
    buttons?: CustomButtons
}

export interface Config extends BaseConfig {
    slides: Slide[]
}

export const PRESENTATION_DEFAULTS: Config = {
    slides: [
        {
            type: 'text',
            aspect: '1:1',
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
        },
    ],
}
