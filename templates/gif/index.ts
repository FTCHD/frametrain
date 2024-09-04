import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    gif: string
    label: string
    link: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'GIF',
    description: 'Create a GIF Frame from any local or YouTube video.',
    shortDescription: 'Video to GIF',
    icon: icon,
    octicon: 'play',
    creatorFid: '416810',
    creatorName: 'alekcangp',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {},
    events: [],
} satisfies BaseTemplate
