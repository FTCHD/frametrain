import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    requiresValidation: true
    images: []
}

export interface State extends BaseState {}

export const initialState: State = {}

export default {
    name: 'Basic Template',
    description: 'Template for a Frame',
    creatorFid: '91716',
    creatorName: 'Korinna',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialState,
    initialConfig: {} as Config,
    requiresValidation: false,
} satisfies BaseTemplate
