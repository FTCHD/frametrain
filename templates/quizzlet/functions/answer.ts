'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import QuestionView from '../views/Question'
import { choicesRepresentation } from '../utils'
import PreReviewAnswersView from '../views/PreReview'

export default async function answer(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const answer = body.untrustedData.buttonIndex
    const pastAnswers = state.answers?.[student] ?? []
    console.log('Quizzlet.answer >> top', { state, params, student, answer, pastAnswers })
    const answers = state.answers?.[student] ?? []

    let newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const lastPage = nextPage === qnaCount
    const currentPage = nextPage - 1
    const qna = config.qna[currentPage]

    console.log('Quizzlet.answer >> qna', { qna, nextPage, qnaCount, lastPage, currentPage })

    const buttons: FrameButtonMetadata[] = []

    newState = Object.assign(state, {
        answers: {
            ...(state.answers ?? {}),
            [student]: [...answers, { questionIndex: nextPage, answerIndex: answer }],
        },
    })

    // if (body.untrustedData.buttonIndex === 2 && lastPage) {
    //     buttons.push({
    //         label: 'Create Your Own',
    //         action: 'link',
    //         target: 'https://frametra.in',
    //     })
    // }

    const { qna: qnas, ...rest } = config
    if (nextPage < qnaCount) {
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

    console.log('/answer for quizzlet', {
        student,
        answer,
        pastAnswers,
        nextPage,
        lastPage,
        qna,
        rest,
        newState,
    })

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons,
        state: newState,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: lastPage ? PreReviewAnswersView(config) : QuestionView({ qnas, qna, ...rest }),
        functionName: lastPage ? 'prereview' : 'answer',
        params: lastPage ? { currentPage: nextPage } : undefined, //{ currentPage: nextPage, answers: newState.answers },
    }
}
