import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { dimensionsForRatio } from '@/sdk/constants'
import Inspector from './Inspector'
import cover from './cover.avif'
import handlers from './handlers'
import icon from './icon.avif'

export type StyleConfig = {
    textColor: string
    backgroundColor: string
    fontSize: string
    fontWeight: string
    fontFamily: string
    fontStyle:
        | 'italic'
        | 'normal'
        | 'oblique'
        | '-moz-initial'
        | 'inherit'
        | 'initial'
        | 'revert'
        | 'revert-layer'
        | 'unset'
}

export interface Config extends BaseConfig {
    qna: {
        question: string
        answers: string
        answer: string
        choices: string[]
        index: number
        design: {
            questionSize: string
            questionColor: string
            answersSize: string
            answersColor: string
            qnaFont: string
            qnaStyle: string
            barColor: string
            backgroundColor?: string
            reviewColor?: string
            reviewBackgroundColor?: string
            reviewSize?: string
        }
    }[]
    results: {
        background: string
        yesLabel: string
        yesBarColor: string
        noLabel: string
        noBarColor: string
        labelBackground: string
        labelColor: string
    }
    background?: string
    textColor?: string
    barColor?: string
    cover: {
        label: string
        image?: string
        text?: string
        subtitle?: string
        configuration?: StyleConfig
        aspectRatio?: keyof typeof dimensionsForRatio
    }
    success: {
        label?: string
        image?: string
        url?: string
        text?: string
        subtitle?: string
        configuration?: StyleConfig
        aspectRatio?: keyof typeof dimensionsForRatio
    }
    fids: string[]
    answerOnce: boolean
    currentQnaIndex: number
}

export interface Storage extends BaseStorage {
    // with questions and answers form being in the following format
    // qna: [ { question: string, answer: string, choices: string[] } ]
    // answers should be in the following format
    // answers: { [fid: string]: [{ questionIndex: number, answerIndex: number }] }
    answers: {
        [fid: string]: {
            questionIndex: number
            answer: string
        }[]
    }
    ids?: string[]
}

export default {
    name: 'Quizlet',
    description: 'Your own multiple choice Quiz as a Frame. Show a secret screen on success!',
    shortDescription: 'Show hidden content',
    icon: icon,
    octicon: 'gift',
    creatorFid: '260812',
    creatorName: 'Steve',
    enabled: true,
    Inspector,
    handlers,
    cover,
    initialConfig: {
        qna: [],
        cover: {
            label: 'START',
            type: 'text',
            text: `🎉 Welcome to Quizzlet!
      Press "START" to being your journey`,
            configuration: {
                textColor: '#ffffff',
                backgroundColor: '#09203f',
                fontSize: '50px',
                fontWeight: '900',
                fontFamily: 'Roboto',
            },
        },
        success: {
            image: null,
            label: null,
            href: null,
        },
        fids: [],
        answerOnce: false,
        currentQnaIndex: 0,
        results: {
            yesLabel: 'Correct Answers',
            yesBarColor: 'green',
            noLabel: 'Wrong Answers',
            noBarColor: 'red',
            background: '#09203f',
            labelBackground: 'rgba(255, 255, 255, 0.22)',
            labelColor: 'white',
        },
    },
    events: ['quiz.initialize', 'quiz.qna', 'quiz.results'],
} satisfies BaseTemplate
