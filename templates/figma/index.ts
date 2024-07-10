import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpg'
import functions from './functions'

export interface Config extends BaseConfig {
    text: string
}

export interface State extends BaseState {}

export default {
    name: 'Figma',
    description: 'Transform your Figma designs into interactive Frame experiences!',
    creatorFid: '426045',
    creatorName: 'rjs',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        text: 'Default Text',
    },
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
