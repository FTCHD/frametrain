import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    text: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Figma',
    description: 'Transform your Figma designs into interactive Frame experiences!',
    creatorFid: '426045',
    creatorName: 'rjs',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        text: 'Default Text',
    },
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
