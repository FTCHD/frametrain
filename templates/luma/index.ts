import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'

export interface Config extends BaseConfig {
    event?: {
        id: string
        price: string
        backgroundImage: string
        hosts: string[]
        startsAt: string
        endsAt?: string | null
        timezone: string
        title: string
        address?: string
        image?: string
        approvalRequired?: boolean
        remainingSpots?: number | null
    }
    backgroundColor?: string
    textColor?: string
    priceColor?: string
    priceBackgroundColor?: string
    infoColor?: string
}

export interface State extends BaseState {}

export default {
    name: 'Lu.ma Template',
    description: 'Share your Lu.ma event as a Frame.',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    functions,
    requiresValidation: false,
    initialConfig: {
        event: undefined,
    },
} satisfies BaseTemplate
