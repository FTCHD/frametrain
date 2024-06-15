import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.png'
import functions from './functions'
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

export interface State extends BaseState {}

export default {
    name: 'Medium Template',
    description: 'Share medium articles that can be read within a Frame with multiple slides.',
    creatorFid: '20417',
    creatorName: 'Q',
    enabled: true,
    Inspector,
    functions,
    cover,
    requiresValidation: false,
} satisfies BaseTemplate
