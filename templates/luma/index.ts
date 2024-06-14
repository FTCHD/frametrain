import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'

export interface Config extends BaseConfig {
    eventId: string
}

export interface State extends BaseState {}

export default {
    name: 'Lu.ma Events Preview',
    description: 'Create a Lu.ma event preview Frame',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        eventId: 's5-kickoff',
    },
    requiresValidation: false,
} satisfies BaseTemplate
