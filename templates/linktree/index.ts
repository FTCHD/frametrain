import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpg'
import handlers from './handlers'
export type LinkType =
    | 'twitter'
    | 'warpcast'
    | 'website'
    | 'blog'
    | 'github'
    | 'linkedin'
    | 'instagram'

export interface Link {
    type: LinkType
    url: string
}

export interface Config extends BaseConfig {
    links: Link[]
    cover: {
        title: string
        titleColor: string
        linkTreeColor?: string
        backgroundColor: string
        usernameColor: string
    }
    userData: {
        userImageUrl: string
        username: string
    }
}

export interface Storage extends BaseStorage {}

const defaultConfig: Config = {
    links: [],
    cover: {
        title: 'My Links',
        titleColor: '#000',
        backgroundColor: '#fbbf24',
        usernameColor: '#15803d',
    },
    userData: {
        userImageUrl: 'https://i.imgur.com/mt3nbeI.jpg',
        username: 'complexlity',
    },
}
export default {
    name: 'LinkTree',
    description: 'An easy way to share your links',
    shortDescription: 'An easy way to share your links',
    octicon: 'link-external',
    creatorFid: '213144',
    creatorName: 'Complexlity',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: defaultConfig,
    events: [],
} satisfies BaseTemplate
