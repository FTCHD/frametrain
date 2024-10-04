import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export type GatingErcType = {
    address: string
    amount: number
}

export type GatingMoxieType = {
    symbol: string
    balance: number
    address: string
}

export type GatingScoreType = {
    score: number
    owner: number
}

export type GatingRequirementsType = {
    channels?: string[]
    minFid?: number
    maxFid?: number
    exactFids?: number[]
    score?: GatingScoreType
    erc20?: GatingErcType[]
    erc721?: GatingErcType[]
    erc1155?: GatingErcType[]
    moxie?: GatingMoxieType[]
}

export type GatingType = {
    enabled: string[]
    requirements: GatingRequirementsType
}

export interface Config extends BaseConfig {
    coverType: 'image' | 'basicView'
    coverImage: string
    coverTitle: string
    coverSubtitle: string
    coverBottomMessage: string
    submittedType: 'image' | 'basicView'
    submittedImage: string
    submittedTitle: string
    submittedSubtitle: string
    submittedBottomMessage: string
    paymentEnabled: boolean
    paymentAmount: number
    paymentAddress: string
    publicSubmissions: boolean
    gating: GatingType
}

export interface Storage extends BaseStorage {
    questions: Question[]
    payments: Payment[]
}

export interface Question {
    id: string
    text: string
    answer?: string
    fid: number
    username: string
    timestamp: number
}

export interface Payment {
    questionId: string
    fid: number
    timestamp: number
}

export default {
    name: 'AskMe',
    description: 'Create a Q&A session with optional payment gating',
    shortDescription: 'Q&A with payment option',
    octicon: 'question',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        coverType: 'basicView',
        coverImage: '',
        coverTitle: 'Ask Me Anything',
        coverSubtitle: 'Submit your questions and get answers',
        coverBottomMessage: 'Tap to start',
        submittedType: 'basicView',
        submittedImage: '',
        submittedTitle: 'Question Submitted',
        submittedSubtitle: 'Thanks for your question!',
        submittedBottomMessage: "We'll answer soon",
        paymentEnabled: false,
        paymentAmount: 0,
        paymentAddress: '',
        publicSubmissions: true,
        gating: {
            enabled: [],
            requirements: {
                channels: [],
                minFid: 0,
                maxFid: 0,
                exactFids: [],
                score: { score: 0, owner: 0 },
                erc20: [],
                erc721: [],
                erc1155: [],
                moxie: [],
            },
        },
    },
    events: ['askme.question.submitted', 'askme.answer.submitted'],
} satisfies BaseTemplate
