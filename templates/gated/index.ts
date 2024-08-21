import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'

export interface Config extends BaseConfig {
    owner: {
        username: string
        fid: number
    } | null
    welcomeText: string | null
    label: string | null
    rewardMessage: string | null
    rewardImage: string | null
    links: string[]
    requirements: GatingOptionsProps['config']
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
        owner: null,
        welcomeText: null,
        rewardMessage: null,
        label: null,
        rewardImage: null,
        links: [],
        requirements: {
            channels: {
                checked: false,
                data: [],
            },
            followedBy: false,
            following: false,
            liked: false,
            recasted: false,
            eth: false,
            sol: false,
            powerBadge: false,
            maxFid: 0,
            score: 0,
            erc20: null,
            erc721: null,
            erc1155: null,
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
