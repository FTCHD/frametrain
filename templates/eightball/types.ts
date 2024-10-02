import type { FramePayloadValidated } from '@/lib/farcaster'
import type { GatingErcType } from '@/sdk/components/gating/types'

export type ButtonConfig = {
    label: string
}

export type ErrorDisplayConfig = {
    style: React.CSSProperties
    buttons: ButtonConfig[]
    handler: string
    errorContent?: string | JSX.Element
}

export interface Config {
    cover: {
        title: string
        subtitle: string
        bottomMessage: string
        backgroundColor: string
        textColor: string
    }
    answer: {
        title: string
        bottomMessage: string
        backgroundColor: string
        textColor: string
    }
    cooldown: number
    isPublic: boolean
    gating: GatingErcType
}

export interface Storage {
    lastAnswerTime?: number
    questions?: Array<{
        question: string
        answer: string
        timestamp: number
        fid: number
    }>
}

export interface HandlerContext {
    body: FramePayloadValidated
    config: Config
    storage: Storage
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

export class Magic8BallError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'Magic8BallError'
    }
}

export function getRandomAnswer(): string {
    return ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
}

export function checkCooldown(lastAnswerTime: number | undefined, cooldown: number): void {
    if (!lastAnswerTime) return

    const now = Date.now()
    if (cooldown > 0 && now - lastAnswerTime < cooldown * 1000) {
        throw new Magic8BallError(`Please wait ${cooldown} seconds between questions`)
    }
}

export function validateQuestion(question: string | undefined): asserts question is string {
    if (!question) {
        throw new Magic8BallError('Please ask a question')
    }
}
