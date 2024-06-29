import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.webp'
import functions from './functions'

export interface Config extends BaseConfig {
    gif: string
    label: string
    link: string
}

export interface State extends BaseState {}

export default {
    name: 'GIF Template',
    description: 'Create a GIF Frame from any local or Youtube video. Add a link too!',
    creatorFid: '416810',
    creatorName: 'alekcangp',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {},
    requiresValidation: false,
} satisfies BaseTemplate
