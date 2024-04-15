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
    name: 'Tweet Template',
    description: 'Transform a tweet or multiple tweets into a Frame.',
    creatorFid: '91716',
    creatorName: 'Mike21',
    enabled: true,
    Inspector,
    functions,
    initialState,
    initialConfig: {} as Config,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
