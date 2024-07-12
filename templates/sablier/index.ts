import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    streamId: string
    shape: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Sablier Template',
    description: 'Get the latest details about a Sablier stream.',
    creatorFid: '10677',
    creatorName: 'Paul',
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        streamId: 'LL-1-70',
        shape: 'Linear',
    } as Config,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
