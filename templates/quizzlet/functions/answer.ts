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
    const answer = body.untrustedData.buttonIndex
    const pastAnswers = state.answers?.[student] ?? []
    console.log('Quizzlet.answer >> top', { state, params, student, answer, pastAnswers })
    const answers = state.answers?.[student] ?? []
    const userState = answers

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
        qna,
        rest,
        newState,
    })

    const userAnswer =
        choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][
            state.answers[student].find((a) => a.questionIndex === currentPage)?.answerIndex ?? 0
        ]

    const roboto = await loadGoogleFontAllVariants('Roboto')
    if (isDev) {
        if (localAnswers.has(answers)) {
            localAnswers.delete(answers)
            localAnswers.add(newState.answers[student])
        }

        const v = [...localAnswers][0]
        console.log('Quizzlet.answer >> localAnswers', { localAnswers, v })
    }

    return {
        buttons,
        state: newState,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: lastPage
            ? isDev
                ? ReviewAnswersView({ qna, qnas, colors, userAnswer, ...rest })
                : PreReviewAnswersView(config)
            : QuestionView({ qnas, qna, ...rest }),
        functionName: lastPage ? (isDev ? 'review' : 'prereview') : 'answer',
        params: lastPage ? { currentPage: nextPage } : undefined, //{ currentPage: nextPage, answers: newState.answers },
    }
}
