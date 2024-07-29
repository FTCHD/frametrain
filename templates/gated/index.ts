import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    welcomeText: string | null
    rewardMessage: string | null
    rewardImage: string | null
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Gated',
    description: 'Create your own Gated Frame to reward your fans.',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        welcomeText: null,
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
