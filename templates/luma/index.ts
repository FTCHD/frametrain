import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'

export interface Config extends BaseConfig {
    event?: {
        id: string
        price: string
        backgroundCover: string
        hosts: string[]
        startsAt: string
        endsAt?: string | null
        timezone: string
        title: string
        address?: string

        approvalRequired?: boolean
        remainingSpots?: number | null
    }
    backgroundColor?: string
    textColor?: string
    priceColor?: string
    priceBackgroundColor?: string
    infoColor?: string
    fids: string[]
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
    requiresValidation: false,
    initialConfig: {
        event: undefined,
        fids: [],
    },
} satisfies BaseTemplate
