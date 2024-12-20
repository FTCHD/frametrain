import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import type { BasicViewProps } from '@/sdk/views/BasicView'
import type { paths } from '@reservoir0x/reservoir-sdk'
import Inspector from './Inspector'
import type { NftInfo } from './common/reservoir'
import cover from './cover.jpeg'
import handlers from './handlers'

type NftOrders = NonNullable<
    paths['/orders/asks/v5']['get']['responses']['200']['schema']['orders']
>

type NftMetadata = NftInfo & {
    orders: NftOrders
}

export interface Config extends BaseConfig {
    nfts: NftMetadata[]
    owner: {
        username: string
        fid: number
    } | null
    enableGating: boolean
    gating: GatingType
    cover: BasicViewProps & {
        image?: string
    }
    success: BasicViewProps & {
        image?: string
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'NFT Store',
    description: 'Your onchain storefront for NFTs.',
    shortDescription: 'NFt Storefront',
    octicon: 'credit-card', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        owner: null,
        nfts: [],
        enableGating: false,
        cover: {
            background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
            title: { text: 'My NFT Store', fontfamily: 'Inter' },
            subtitle: { text: 'Welcome to my NFT Store!', fontfamily: 'Inter' },
            bottomMessage: { text: 'You can explore and buy my NFTs.', fontfamily: 'Inter' },
        },
        success: {
            background: 'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
            title: { text: 'Your transaction was successful', fontfamily: 'Inter' },
            subtitle: { text: 'Thanks for your purchase', fontfamily: 'Inter' },
            bottomMessage: { text: 'We appreciate your support.', fontfamily: 'Inter' },
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
