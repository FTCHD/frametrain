import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { ChainKey } from './utils/viem'

type Styles = {
    color?: string
    size?: number
    weight?: string
    position?: string
    family?: string
    style?: string
}

export interface Config extends BaseConfig {
    address?: string
    locked: boolean
    token?: {
        address: `0x${string}`
        chain?: ChainKey
        symbol?: string
    }
    enablePredefinedAmounts: boolean
    amounts: number[]
    cover?: {
        title: string
        description: string
        background?: string
        barColor?: string
        titleStyles?: Styles
        descriptionStyles?: Styles
    }
    success?: {
        image?: string
        title?: string
        description?: string
        background?: string
        titleStyles?: Styles
        descriptionStyles?: Styles
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Fundraiser',
    description: 'Create a Fundraiser Frame!',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        locked: false,
        enablePredefinedAmounts: false,
        isEns: false,
        amounts: [],
        cover: {
            title: 'Cover',
            description: 'Description',
        },
        success: {
            title: 'Success',
            description: 'Description',
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
