import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'

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
    name: 'PDF Template',
    description: 'Upload and convert your PDF into a Frame with multiple slides.',
    creatorFid: '2',
    creatorName: 'Varun',
    enabled: true,
    Inspector,
    handlers,
    cover,
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
