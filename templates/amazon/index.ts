import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import type { BasicViewProps, BasicViewStyle } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.png'
import handlers from './handlers'
import icon from './icon.jpg'

export interface Config extends BaseConfig {
    products: {
        url: string
        title: string
        image: string
        price: string
        stars: string
        ratings: string
        styles?: {
            title: BasicViewStyle | undefined
            info: BasicViewStyle | undefined
            background: string | undefined
        }
    }[]
    cover: BasicViewProps & {
        image?: string
    }
    success: BasicViewProps & {
        image?: string
    }
    gating: GatingType
    enableGating: boolean
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Amazon Wishlist',
    description: 'Showcase your Amazon wishlist as a Frame.',
    shortDescription: 'Your Amazon Wishlist',
    octicon: 'gift', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    icon,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        products: [],
        enableGating: false,
        cover: {
            title: { text: 'Amazon Whishlist Frame' },
            subtitle: { text: 'Welcome to the Amazon Whishlist Frame!' },
            customMessage: { text: 'Check out my wishlist😉' },
        },
        success: {
            title: { text: 'Thank you for checking out my amazon whishlist!' },
            subtitle: { text: `I hope my wishlist wasn't too overwhelming!` },
            customMessage: { text: `Don't forget to help me with my wishlist!` },
        },
        gating: {
            enabled: [],
            requirements: {
                maxFid: 0,
                minFid: 0,
                score: 0,
                channels: [],
                exactFids: [],
                erc20: null,
                erc721: null,
                erc1155: null,
                moxie: null,
            },
        },
    },
    events: [],
} satisfies BaseTemplate
