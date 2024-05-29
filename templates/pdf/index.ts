import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

export interface Config extends BaseConfig {
    slideUrls: string[]
    title?: string
    subtitle?: string
    backgroundColor?: string
    textColor?: string
    aspectRatio?: string
}

export interface State extends BaseState {}

export default {
    name: 'PDF Template',
    description: 'Upload and convert your PDF into a Frame with multiple slides.',
    creatorFid: '2',
    creatorName: 'Varun',
    enabled: true,
    Inspector,
    functions,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
