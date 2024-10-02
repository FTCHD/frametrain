import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    titleWeight?: string
    titleStyle?: string
    background?: string
    bodyColor?: string
    cooldown: number
    isPublic: boolean
    coverConfig: {
        title: string
        subtitle: string
        bottomMessage: string
        backgroundColor: string
        textColor: string
    }
    answerConfig: {
        title: string
        bottomMessage: string
        backgroundColor: string
        textColor: string
    }
    gating: GatingType | undefined
    enableGating: boolean | undefined
}

export interface Storage extends BaseStorage {
    lastAnswerTime?: number
    questions?: Array<{
        question: string
        answer: string
        timestamp: number
        fid: number
    }>
}

export default {
    name: 'Magic 8 Ball',
    description: 'Ask a question and receive a mystical answer from the Magic 8 Ball!',
    shortDescription: 'Virtual fortune teller',
    icon: '',
    octicon: 'crystal-ball',
    creatorFid: '197049',
    creatorName: 'codingsh',
    cover,
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {
        cooldown: 60,
        isPublic: true,
        coverConfig: {
            title: 'Magic 8 Ball',
            subtitle: 'Ask a question and receive mystical guidance!',
            bottomMessage: "Tap 'Ask' to begin",
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
        },
        answerConfig: {
            title: 'The 8 Ball says...',
            bottomMessage: 'Ask another question to play again!',
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
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
    events: ['question.asked', 'question.answered'],
} satisfies BaseTemplate
