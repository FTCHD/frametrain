'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import { choicesRepresentation } from '../utils'
import ReviewAnswersView from '../views/Review'

export default async function review(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const pastAnswers = state.answers?.[student] ?? []

    const newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = nextPage === qnaCount
    const currentQnaIndex = params?.currentPage ? currentPage : 0

    const buttons: FrameButtonMetadata[] = []

    const qna = config.qna[currentQnaIndex]

    const { qna: qnas, ...rest } = config

    const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
    const foundChoice = pastAnswers.find((a) => a.questionIndex === qna.index)
    const userChoice = foundChoice?.answerIndex ? foundChoice.answerIndex - 1 : 0
    const userAnswer = choicesRepresentation[choiceType][userChoice]

    const correctAnswers = pastAnswers.reduce((acc, answer) => {
        const qna = config.qna[answer.questionIndex - 1]
        const choice =
            choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][answer.answerIndex - 1]
        if (qna.answer === choice) {
            return acc + 1
        }
        return acc
    }, 0)

    const showImage = correctAnswers === config.qna.length
    if (lastPage) {
        buttons.push({
            label: '← Home',
        })

        if (showImage) {
            if (config.success.image) {
                buttons.push({
                    label: 'A Gift For you',
                })
            }
        } else {
            buttons.push({
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            })
        }
    } else {
        buttons.push({ label: '→' })
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const colors = {
        background: config?.background,
        textColor: config?.textColor,
        barColor: config?.barColor,
    }

    return {
        buttons,
        state: newState,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: ReviewAnswersView({ qnas, qna, colors, userAnswer, ...rest }),
        functionName: lastPage ? 'success' : 'review',
        params: !lastPage ? { currentPage: nextPage } : undefined,
    }
}
