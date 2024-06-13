import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'

export interface Config extends BaseConfig {
    qna: {
        question: string
        answer: string
        choices: number
        isNumeric: boolean
        index: number
    }[]
    beforeReview?: {
        screen: string
        label: string
    }
    background?: string
    textColor?: string
    barColor?: string
    cover: {
        image: string | null
        label: string | null
    }
    success: {
        image: string | null
        label: string | null
        href: string | null
    }
}

export interface State extends BaseState {
    // with questions and answers form being in the following format
    // qna: [ { question: string, answer: string, choices: string[] } ]
    // answers should be in the following format
    // answers: { [fid: string]: [{ questionIndex: number, answerIndex: number }] }
    answers: {
        [fid: string]: {
            questionIndex: number
            answerIndex: number
        }[]
    }
}

export default {
    name: 'Quizzlet Template',
    description: 'Create your own Multiple-Choice Questions Quiz as a Farcaster Frame.',
    creatorFid: '260812',
    creatorName: 'Steve',
    enabled: true,
    Inspector,
    functions,
    cover,
    initialConfig: {
        qna: [],
        beforeReview: {
            screen: `Next, let's review your answers.`,
            label: 'Review your answers',
        },
        cover: {
            image: null,
            label: null,
        },
        success: {
            image: null,
            text: null,
        },
    },
    requiresValidation: true,
} satisfies BaseTemplate
