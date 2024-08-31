import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import type { GatingOptionsProps } from '@/sdk/components/GatingOptions'
import type { TextSlideProps } from '@/sdk/components/TextSlide'

export interface Config extends BaseConfig {
    owner: {
        username: string
        fid: number
    } | null
    label: string | null
    links: string[]
    requirements: GatingOptionsProps['config']
    cover: TextSlideProps & {
        image?: string
    }
    success: TextSlideProps & {
        image?: string
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Gated',
    description: 'Create your own Gated Frame to reward your fans.',
    shortDescription: 'Gate your Frame!',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        owner: null,
        label: null,
        links: [],
        cover: {
            title: { text: 'Untitled Gated Frame' },
            subtitle: { text: 'Welcome to the Gated Frame!' },
            customMessage: { text: 'You can add a custom message here.' },
        },
        success: {
            title: { text: 'You have unlocked the content!' },
            subtitle: { text: 'Enjoy your reward.' },
            customMessage: { text: 'We appreciate you sticking around.' },
        },
        requirements: {
            channels: {
                checked: false,
                data: [],
            },
            followedBy: false,
            following: false,
            liked: true,
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
