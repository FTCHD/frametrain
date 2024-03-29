import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

export interface Config extends BaseConfig {
    images: []
}

export interface State extends BaseState {}

export const initialState: State = {}

export default {
    name: 'PDF Template',
    description: 'Upload and convert your PDF into a Frame with multiple slides.',
    creatorFid: '91716',
    creatorName: 'Jake',
    enabled: true,
    Inspector,
    functions,
    initialState,
    initialConfig: {} as Config,
    cover,
    requiresValidation: true,
} satisfies BaseTemplate
