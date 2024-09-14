import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { ChainKey } from '@/sdk/viem'
import type { BasicViewProps } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

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
    cover: BasicViewProps & {
        image?: string
    }
    success: BasicViewProps & {
        image?: string
    }
    about: BasicViewProps & {
        image?: string
    }
    barColor: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Fundraiser',
    description: 'Start your own onchain GoFundMe as a Frame.',
    shortDescription: 'GoFundMe, onchain',
    icon: icon,
    octicon: 'heart',
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
        barColor: '#FFFF00',
        cover: {
            title: { text: 'Fundraiser' },
            subtitle: { text: 'Welcome to the Fundraiser!' },
            bottomMessage: { text: 'You can customize this message.' },
        },
        success: {
            title: { text: 'Thanks for your donation!' },
            subtitle: { text: 'Your donation has been received.' },
            bottomMessage: { text: 'We appreciate your support.' },
        },
        about: {
            title: { text: 'About' },
            subtitle: { text: 'Subtitle' },
            bottomMessage: { text: 'You can customize this message.' },
        },
    },
    events: [],
} satisfies BaseTemplate
