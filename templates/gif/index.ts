import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'

export interface Config extends BaseConfig {
    gif: string
    label: string
    link: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'GIF Template',
    description: 'Create a GIF Frame from any local or Youtube video. Add a link too!',
    creatorFid: '416810',
    creatorName: 'alekcangp',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {},
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
