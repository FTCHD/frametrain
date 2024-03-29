import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

export interface Config extends BaseConfig {
    options: {
        buttonLabel: string
        displayLabel: string
        index: number
    }[]
}

export interface State extends BaseState {
    votesForId: Record<string, number>
}

export const initialState: State = {
    votesForId: {},
}

export default {
    name: 'Poll Template',
    description: 'Create your own Poll as a Farcaster Frame.',
    creatorFid: '91716',
    creatorName: 'Logan',
    enabled: true,
    Inspector,
    functions,
    initialState,
    initialConfig: {} as Config,
    cover,
    requiresValidation: true,
} satisfies BaseTemplate
