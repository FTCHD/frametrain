import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export interface Config extends BaseConfig {
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    titleWeight?: string
    titleStyle?: string
    background?: string
    bodyColor?: string
    timezone: string | undefined
    fid: number | undefined
    image: string | undefined
    name: string | undefined
    username: string | undefined
    bio: string[]
    events: {
        slug: string
        duration: string
        formattedDuration: string
    }[]

    gatingOptions: {
        karmaGating: boolean
        nftGating: boolean
        recasted: boolean
        liked: boolean
        follower: boolean
        following: boolean
    }
    nftOptions: {
        nftAddress: string
        nftName: string
        nftType: string
        nftChain: string
        tokenId: string
    }
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Cal',
    description: 'Let people book calls with you straight from a Frame. Gating included.',
    shortDescription: 'Cal.com + Farcaster',
    icon: icon,
    octicon: 'tasklist',
    creatorFid: '389273',
    creatorName: 'LeoFrank',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        events: [],
        bio: [],
        timezone: 'Europe/London',
        gatingOptions: {
            karmaGating: false,
            nftGating: false,
            recasted: false,
            liked: false,
            follower: false,
            following: false,
        },
        nftOptions: {
            nftChain: 'ETH',
            nftType: 'ERC721',
        },
    },
    requiresValidation: true,
    events: [],
} satisfies BaseTemplate
