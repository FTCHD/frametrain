import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { TextSlideProps } from '@/sdk/components/TextSlide'
import Inspector from './Inspector'
import type { SerializableConfig } from './common/etherscan'
import cover from './cover.png'
import handlers from './handlers'

export interface Config extends BaseConfig {
    etherscan: SerializableConfig | null
    cover: TextSlideProps & {
        image?: string
    }
    functionSlide?: TextSlideProps
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
    description: 'Your own Smart Contract Frame',
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
                text: 'Welcome to Blockscan',
            },
            subtitle: {
                text: 'Navigate through all contract functions',
            },
            customMessage: {
                text: 'Custom Message',
            },
            color: '#ffffff',
            background: '#000000',
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
