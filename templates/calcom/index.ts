import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    name: string
    id: number
    bio: string
    timeZone: string
    username: string
    apiKey: string
    dates: string[][]
    slots: string[]
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    titleWeight?: string
    titleStyle?: string
    background?: string
    bodyColor?: string
    maxBookingDays: number
    karmaGating: boolean
    nftGating: boolean
    nftAddress: string
    nftName: string
    fid: number
    nftType: string
    nftChain: string
    tokenID: string
    recasted: boolean
    liked: boolean
    follower: boolean
    following: boolean
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
        karmaGating: false,
        nftGating: false,
        recasted: false,
        liked: false,
        follower: false,
        following: false,
    },
    requiresValidation: true,
} satisfies BaseTemplate
