import type { FramePayloadValidated } from '@/lib/farcaster'
import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import type { GatingType } from '@/sdk/components/gating/types'

export interface ViewConfig {
    title: { text: string; color?: string }
    subtitle?: { text: string; color?: string }
    bottomMessage: { text: string; color?: string }
    backgroundColor: string
    textColor: string
}

export interface Config extends BaseConfig {
    fontFamily: string
    fontWeight: string
    fontStyle: string
    background: string
    cooldown: number
    isPublic: boolean
    coverConfig: ViewConfig
    answerConfig: ViewConfig
    gating?: GatingType
    enableGating: boolean
}

export interface QuestionAnswer {
    question: string
    answer: string
    timestamp: number
    fid: number
}

export interface Storage extends BaseStorage {
    lastAnswerTime?: number
    questions: QuestionAnswer[]
}

export interface HandlerContext {
    body: {
        input: {
            text: string
        }
        interactor: {
            fid: number
        }
    }
    config: Config
    storage: Storage
    params?: Record<string, unknown>
}

export class Magic8BallError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'Magic8BallError'
    }
}

export const ANSWERS = [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes definitely',
    'You may rely on it',
    'As I see it, yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
    'Reply hazy, try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    "Don't count on it",
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful',
]

export function getRandomAnswer(): string {
    return ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
}

export const checkCooldown = (lastAnswerTime: number | undefined, cooldown: number): void => {
    if (lastAnswerTime && cooldown > 0 && Date.now() - lastAnswerTime < cooldown * 1000) {
        throw new Magic8BallError(`Please wait ${cooldown} seconds between questions`)
    }
}

export function validateQuestion(question: string | undefined): asserts question is string {
    if (!question) {
        throw new Magic8BallError('Please ask a question')
    }
}
