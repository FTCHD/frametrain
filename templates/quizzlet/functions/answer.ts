'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import QuestionView from '../views/Question'
import { choicesRepresentation, isDev } from '../utils'
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
    console.log('Quizzlet.answer >> top', { state, params, choice, pastAnswers })

    let newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = nextPage === qnaCount
    const qna = config.qna[currentPage]
    const nextQna = config.qna[nextPage]
    const { qna: qnas, ...rest } = config

    console.log('Quizzlet.answer >> qna', { qna, nextPage, qnaCount, lastPage, currentPage })
    console.log('Quizzlet.answer >> nextPage <= qnaCount', nextPage <= qnaCount)

    const buttons: FrameButtonMetadata[] = []

    pastAnswers.push({ questionIndex: currentPage, answerIndex: choice })

    newState = Object.assign(state, {
        answers: {
            ...(state.answers ?? {}),
            [student]: pastAnswers,
        },
    })

    if (!lastPage) {
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

    // const colors = {
    //     background: config?.background,
    //     textColor: config?.textColor,
    //     barColor: config?.barColor,
    // }

    console.log('/answer for quizzlet', {
        pastAnswers,
        nextPage,
        lastPage,
        nextQna,
    })

    // const userAnswer =
    //     choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][
    //         state.answers[student].find((a) => a.questionIndex === currentPage)?.answerIndex ?? 0
    //     ]

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons,
        state: newState,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: lastPage
            ? PreReviewAnswersView(config)
            : QuestionView({ qnas, qna: nextQna, ...rest }),
        functionName: lastPage ? 'prereview' : 'answer',
        params: lastPage ? undefined : { currentPage: nextPage },
    }
}
