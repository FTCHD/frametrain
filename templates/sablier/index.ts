import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    images: []
}

export interface State extends BaseState {}

export const initialState: State = {}

export default {
    name: 'Sablier Template',
    description: 'Get the latest details about a Sablier stream.',
    creatorFid: '10677',
    creatorName: 'Paul',
    enabled: true,
    Inspector,
    functions,
    initialState: {} as State,
    initialConfig: {} as Config,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
