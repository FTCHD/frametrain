import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    slideUrls: string[]
    title?: string
    subtitle?: string
    backgroundColor?: string
    textColor?: string
    aspectRatio?: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'PDF',
    description: 'Upload and convert your PDF into a Frame with multiple slides.',
    shortDescription: 'Upload Your PDF',
    icon: icon,
    octicon: 'stack',
    creatorFid: '2',
    creatorName: 'Varun',
    enabled: true,
    Inspector,
    handlers,
    cover,
    initialConfig: {},
    events: [],
} satisfies BaseTemplate
