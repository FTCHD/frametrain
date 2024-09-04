import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { TextViewProps } from '@/sdk/views/TextView'
import Inspector from './Inspector'
import type { SerializableConfig } from './common/etherscan'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    etherscan: SerializableConfig | null
    cover: TextViewProps & {
        image?: string
    }
    functionSlide?: TextViewProps
}

export interface Storage extends BaseStorage {
    [fid: string]: {
        functionName: string
        index: number
        args: unknown[]
    }[]
}

export default {
    name: 'Smart Contract',
    description: 'Interact with any Smart Contract right from a Frame.',
    shortDescription: 'Contracts as Frames',
    icon: icon,
    octicon: 'code',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        etherscan: null,
        cover: {
            title: {
                text: 'My Contract',
            },
            subtitle: {
                text: 'Use the arrow buttons to navigate through all contract functions.',
            },
            customMessage: {
                text: 'Custom Message',
            },
            color: '#ffffff',
            background: '#000000',
        },
    },
    events: [],
} satisfies BaseTemplate
