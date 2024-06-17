import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    address: string
    message: string
    background: string
    color: string
}

export interface State extends BaseState {}

export default {
    name: 'Crypto Transfer Template',
    description: 'Crypto transfer card for people to donate to the wallet address',
    creatorFid: '661506',
    creatorName: 'oynozan',
    cover,
    enabled: true,
    Inspector,
    functions,
    requiresValidation: false,
} satisfies BaseTemplate
