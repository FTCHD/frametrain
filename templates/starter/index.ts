import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    text: string
}

export interface State extends BaseState {}

export default {
    name: 'Starter Template',
    description: 'Copy this template to create your own',
    creatorFid: '0',
    creatorName: 'FrameTrain',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        text: 'Default Text',
    },
    requiresValidation: false,
} satisfies BaseTemplate
