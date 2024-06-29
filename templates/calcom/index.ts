import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    username: string
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    titleWeight?: string
    titleStyle?: string
    background?: string
    bodyColor?: string
    fid: number
    image: string
    name: string

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
        tokenID: string
    }
}

export interface State extends BaseState {}

export default {
    name: 'Cal.com',
    description: 'Integrate cal.com into your frame',
    creatorFid: '389273',
    creatorName: 'leofrank',
    cover,
    enabled: true,
    Inspector,
    functions,
    initialConfig: {
        gatingOptions: {
            karmaGating: false,
            nftGating: false,
            recasted: false,
            liked: false,
            follower: false,
            following: false,
        },
        nftOptions: {
            nftType: 'ERC721',
        },
    },
    requiresValidation: true,
} satisfies BaseTemplate
