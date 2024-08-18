import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { SerializableConfig } from './utils/etherscan'
import type { TextSlideProps } from '@/sdk/components/TextSlide'

export interface Config extends BaseConfig {
    etherscan: SerializableConfig | null
    coverImage?: string
    coverText?: TextSlideProps
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
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
