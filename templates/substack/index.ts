import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'
import type { SubstackArticle } from './utils'

export interface Config extends BaseConfig {
    article?: SubstackArticle
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
    name: 'Substack',
    description: 'Convert any Substack article into a Farcaster Frame.',
    shortDescription: 'Substack article to Frame',
    octicon: 'log',
    icon: icon,
    creatorFid: '260812',
    creatorName: 'Steve',
    enabled: true,
    Inspector,
    handlers,
    cover,
    initialConfig: {},
    events: [],
} satisfies BaseTemplate
