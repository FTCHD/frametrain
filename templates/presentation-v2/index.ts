import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { BasicViewProps } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export type SlideButton = {
    text: string
    type: 'link' | 'slide' | 'frame' | 'disabled'
    target: string
}

export type Slide = {
    imageUrl: string
    buttons: SlideButton[]
    aspectRatio: '1:1' | '1.91:1'
}

export interface Config extends BaseConfig {
    text: string
    coverType: 'disabled' | 'image' | 'text'
    coverImageUrl?: string
    coverAspectRatio: '1:1' | '1.91:1'
    coverStyling?: BasicViewProps
    coverButtons?: SlideButton[]
    slides: Slide[]
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Presentation V2',
    description: 'Turn images and long texts into powerful slideshows.',
    shortDescription: 'PDF, Images + more!',
    octicon: 'versions',
    creatorFid: '661506',
    creatorName: 'oynozan',
    cover,
    icon,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        coverType: 'disabled',
        slides: [],
    },
    events: [],
} satisfies BaseTemplate
