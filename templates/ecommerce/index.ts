import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import type { BasicViewProps, BasicViewStyle } from '@/sdk/views/BasicView'
import Inspector from './Inspector'
import cover from './cover.webp'
import handlers from './handlers'

export interface Config extends BaseConfig {
    storeInfo: {
        id: number
        name: string
        image: string
        products: {
            id: number
            name: string
            description: string | null
            shortDescription: string
            image: string
            variantType: string | null
            variants: {
                id: number
                variant: string
            }[]
        }[]
    } | null
    cover: BasicViewProps & {
        image?: string
    }
    success: BasicViewProps & {
        image?: string
    }
    gating: GatingType | undefined
    enableGating: boolean | null
    productTitle: BasicViewStyle | undefined
    productDescription: BasicViewStyle | undefined
    productInfo: BasicViewStyle | undefined
    productBackground: string | undefined
}

export interface Storage extends BaseStorage {
    shippingInfo: {
        [fid: string]: {
            address: string
            city: string
            state: string
            zip: string
            country: string
            phonePrefix: string
            phoneNumber: number
            name: string
            email: string
            notes: string | null
        }
    }
    purchases: {
        productId: string
        fid: number
        tx: string
        timestamp: number
        quantity: string
        variant?: string
    }[]
}

export default {
    name: 'Ecommerce',
    description: 'Sell your physical product straight from a Frame.',
    shortDescription: 'Your store in Frame.',
    octicon: 'search', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '260812',
    creatorName: 'Steve',
    enabled: true,
    cover,
    Inspector,
    handlers,
    initialConfig: {
        storeInfo: null,
        productTitle: null,
        productDescription: null,
        productInfo: null,
        productBackground: null,
        cover: {
            title: { text: 'Untitled Ecommerce Frame' },
            subtitle: { text: 'Welcome to the Ecommerce Frame!' },
            customMessage: { text: 'You can add a custom message here.' },
        },
        success: {
            title: { text: 'Thank you for your purchase!' },
            subtitle: { text: 'We appreciate your support.' },
            customMessage: { text: 'Your purchase has been received.' },
        },
        enableGating: false,
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
