import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { SerializableConfig } from './utils/etherscan'

export interface Config extends BaseConfig {
    etherscan: SerializableConfig | null
}

export interface Storage extends BaseStorage {}

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
