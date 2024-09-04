import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import type { TextViewProps } from '@/sdk/views/TextView'
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
    cover: TextViewProps & {
        image?: string
    }
    success: TextViewProps & {
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
    events: [],
} satisfies BaseTemplate
