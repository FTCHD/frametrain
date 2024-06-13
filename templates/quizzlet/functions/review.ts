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
    console.log('Quizzlet.review >> top', { state, params, student, pastAnswers })

    const newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = nextPage === qnaCount
    const currentQnaIndex = params?.currentPage ? currentPage : 0
    const lastShow = currentQnaIndex === qnaCount

    const buttons: FrameButtonMetadata[] = []

    const qna = config.qna[currentQnaIndex]
    console.log('Quizzlet.review >> qna', {
        qna,
        nextPage,
        qnaCount,
        lastPage,
        currentPage,
        currentQnaIndex,
        lastShow,
    })
    const { qna: qnas, ...rest } = config

    const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
    const userChoice = pastAnswers.find((a) => a.questionIndex === currentPage)?.answerIndex ?? 0
    const userAnswer = choicesRepresentation[choiceType][userChoice]
    console.log('Quizzlet.review >> nextPage <= qnaCount', nextPage <= qnaCount)

    // get the total number of correct answers from the user
    // get the total number of wrong answers from the user

    if (lastShow) {
        buttons.push({
            label: 'Check Results',
        })
    } else {
        buttons.push({ label: 'Next' })
    }

    console.log('/review for quizzlet', {
        student,
        pastAnswers,
        nextPage,
        lastPage,
        qna,
        userChoice,
    })

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
        functionName: lastShow ? 'results' : 'review',
        params: !lastShow ? { currentPage: nextPage } : undefined,
    }
}
