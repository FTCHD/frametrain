'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import {
    type ButtonConfig,
    type ErrorDisplayConfig,
    type HandlerContext,
    Magic8BallError,
    checkCooldown,
    getRandomAnswer,
    validateQuestion,
} from '../types'
import AnswerView from '../views/answer'

const errorDisplayConfig: ErrorDisplayConfig = {
    style: {
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '24px',
    },
    buttons: [{ label: 'Try Again' }],
    handler: 'initial',
}

const createButton = (label: string): ButtonConfig => ({ label })

const updateStorage = (
    storage: HandlerContext['storage'],
    body: HandlerContext['body'],
    answer: string
) => ({
    ...storage,
    lastAnswerTime: Date.now(),
    questions: [
        ...(storage.questions || []),
        {
            question: body.inputText,
            answer,
            timestamp: Date.now(),
            fid: body.fid,
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
        validateQuestion(body.inputText)
        checkCooldown(storage.lastAnswerTime, config.cooldown)

        const answer = getRandomAnswer()
        const newStorage = updateStorage(storage, body, answer)

        return {
            buttons: [createButton('Ask Another Question')],
            fonts: roboto,
            component: AnswerView(config, answer),
            handler: 'initial',
            storage: newStorage,
        }
    } catch (error) {
        if (error instanceof Magic8BallError) {
            return {
                ...errorDisplayConfig,
                // Assuming you might want some error message or dynamic content here
                // errorContent: error.message, 
            }
        }
        throw error 
    }
}
