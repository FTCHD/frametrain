'use server'

import type { BuildFrameData } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { Magic8BallError, ANSWERS } from '../types'
import type { HandlerContext } from '../types'
import AnswerView from '../views/answer'
import ErrorView from '../views/error'

const getRandomAnswer = (): string => ANSWERS[Math.floor(Math.random() * ANSWERS.length)]

const checkCooldown = (lastAnswerTime: number | undefined, cooldown: number): void => {
    if (lastAnswerTime && cooldown > 0 && Date.now() - lastAnswerTime < cooldown * 1000) {
        throw new Magic8BallError(`Please wait ${cooldown} seconds between questions`)
    }
}

const validateQuestion = (input: any): string => {
    const question = input?.text
    if (!question || question.trim() === '') {
        throw new Magic8BallError('Please ask a question')
    }
    return question.trim()
}

const updateStorage = (
    storage: HandlerContext['storage'],
    body: HandlerContext['body'],
    answer: string
): HandlerContext['storage'] => ({
    ...storage,
    lastAnswerTime: Date.now(),
    questions: [
        ...(storage.questions || []),
        {
            question: body.input.text,
            answer,
            timestamp: Date.now(),
            fid: body.interactor.fid,
        },
    ],
})

export default async function ask({
    body,
    config,
    storage,
}: HandlerContext): Promise<BuildFrameData> {
    try {
        const roboto = await loadGoogleFontAllVariants('Roboto')

        runGatingChecks(body, config.gating)

        const question = validateQuestion(body.input)
        checkCooldown(storage.lastAnswerTime, config.cooldown)

        const answer = getRandomAnswer()
        const newStorage = updateStorage(storage, body, answer)

        return {
            buttons: [{ label: 'Ask Another Question' }],
            fonts: roboto,
            component: AnswerView({ config, answer, question }),
            handler: 'initial',
            storage: newStorage,
            aspectRatio: '1.91:1',
        }
    } catch (error) {
        if (error instanceof Magic8BallError) {
            return {
                component: ErrorView({ error: error.message }),
                buttons: [{ label: 'Try Again' }],
                handler: 'initial',
                aspectRatio: '1.91:1',
            }
        }
        throw error
    }
}
