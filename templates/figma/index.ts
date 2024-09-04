import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    text: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Figma',
    description: 'Transform your Figma designs into interactive Frame experiences!',
    shortDescription: 'Use your Artboards',
    icon: icon,
    octicon: 'paintbrush',
    creatorFid: '426045',
    creatorName: 'rjs',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        text: 'Default Text',
    },
    events: [],
} satisfies BaseTemplate
