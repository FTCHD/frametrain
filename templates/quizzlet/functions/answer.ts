'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import QuestionView from '../views/Question'
import { choicesRepresentation, isDev, localAnswers } from '../utils'
import PreReviewAnswersView from '../views/PreReview'
import ReviewAnswersView from '../views/Review'

export default async function answer(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const choice = body.untrustedData.buttonIndex
    const pastAnswers = state.answers?.[student] ?? []
    console.log('Quizzlet.answer >> top', { state, params, student, choice, pastAnswers })

    let newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = currentPage === qnaCount
    const qna = config.qna[currentPage]

    console.log('Quizzlet.answer >> qna', { qna, nextPage, qnaCount, lastPage, currentPage })

    const buttons: FrameButtonMetadata[] = []

    pastAnswers.push({ questionIndex: currentPage, answerIndex: choice })

    newState = Object.assign(state, {
        answers: {
            ...(state.answers ?? {}),
            [student]: pastAnswers,
        },
    })
    console.log('Quizzlet.answer >> newState', newState)
    console.log('Quizzlet.answer >> newState answers.length', newState.answers[student].length)

    const { qna: qnas, ...rest } = config
    if (nextPage <= qnaCount) {
        const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
        const choices = Array.from({ length: qna.choices })
        choices.forEach((_, choice) => {
            buttons.push({ label: choicesRepresentation[choiceType][choice] })
        })
    } else {
        buttons.push({
            label: config.beforeReview?.label ?? 'Review Answers',
        })
    }

    const colors = {
        background: config?.background,
        textColor: config?.textColor,
        barColor: config?.barColor,
    }

    console.log('/answer for quizzlet', {
        student,
        answer,
        pastAnswers,
        nextPage,
        lastPage,
    })

    const userAnswer =
        choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][
            state.answers[student].find((a) => a.questionIndex === currentPage)?.answerIndex ?? 0
        ]

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons,
        state: newState,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: lastPage
            ? isDev
                ? ReviewAnswersView({ qna: qnas[0], qnas, colors, userAnswer, ...rest })
                : PreReviewAnswersView(config)
            : QuestionView({ qnas, qna, ...rest }),
        functionName: lastPage ? (isDev ? 'review' : 'prereview') : 'answer',
        params: !lastPage ? { currentPage: nextPage } : undefined,
    }
}
