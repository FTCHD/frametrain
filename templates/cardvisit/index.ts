import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'

export interface Config extends BaseConfig {
    text: string
}

export interface State extends BaseState {}

export default {
    name: 'Cardvisit Template',
    description: 'You can create your own cardvisit as frame',
    creatorFid: '6',
    creatorName: 'Taio Newgate',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        text: 'Default Text',
    },
    requiresValidation: false,
} satisfies BaseTemplate
