import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { TextSlideProps } from '@/sdk/components/TextSlide'
import type { GatingType } from '@/sdk/components/gating/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    owner: {
        username: string
        fid: number
    } | null
    label: string | null
    links: string[]
    gating: GatingType | undefined
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
    description: 'Lock anything behind this Frame with more than 10 gating options.',
    shortDescription: '10+ gating options',
    icon: icon,
    octicon: 'lock',
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
        gating: {
            enabled: [],
            requirements: {
                channels: [],
                maxFid: 0,
                minFid: 0,
                exactFids: [],
                score: 0,
                erc20: null,
                erc721: null,
                erc1155: null,
            },
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
