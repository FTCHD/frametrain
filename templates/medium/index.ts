import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpg'
import handlers from './handlers'
import icon from './icon.png'
import type { Article } from './utils'

export interface Config extends BaseConfig {
    article?: Article
    coverBgColor: string
    coverTextColor: string
    imageSize: number
    textPosition: boolean
    showLinkOnAllPages: boolean
    hideTitleAuthor: boolean
    pagesBgColor: string
    pagesTextColor: string
    pagesFontSize: number
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Medium',
    description: 'Convert any Medium article into a Farcaster Frame.',
    shortDescription: 'Article to Frame',
    octicon: 'log',
    icon: icon,
    creatorFid: '20417',
    creatorName: 'Q',
    enabled: true,
    Inspector,
    handlers,
    cover,
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
