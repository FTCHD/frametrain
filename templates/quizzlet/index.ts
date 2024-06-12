import type { BaseConfig, BaseState, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import functions from './functions'
import { before } from 'node:test'

export interface Config extends BaseConfig {
    options: {
        buttonLabel: string
        displayLabel: string
        index: number
    }[]
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
    cover?: {
        text: string
        label: string
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
    },
    requiresValidation: true,
} satisfies BaseTemplate
