import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    discourseLink: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Discourse Template',
    description: 'Create a Frame from a Discourse discussion.',
    creatorFid: '368382',
    creatorName: 'Chris',
    enabled: true,
    Inspector,
    functions,
    initialConfig: {},
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
