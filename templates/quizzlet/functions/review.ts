'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import ResultsView from '../views/Results'
import { choicesRepresentation } from '../utils'
import ReviewAnswersView from '../views/Review'

export default async function review(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const pastAnswers = state.answers?.[student]
    console.log('Quizzlet.answer >> top', { state, params, student, pastAnswers })

    const newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = nextPage === qnaCount

    const buttons: FrameButtonMetadata[] = []

    const qna = config.qna[currentPage]
    console.log('Quizzlet.answer >> qna', { qna, nextPage, qnaCount, lastPage, currentPage })
    const { qna: qnas, ...rest } = config
    if (nextPage < qnaCount) {
        buttons.push({ label: 'Next' })
    } else {
        buttons.push({
            label: 'Results',
        })
    }
    const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
    const userChoice = pastAnswers.find((a) => a.questionIndex === currentPage)?.answerIndex ?? 0
    const userAnswer = choicesRepresentation[choiceType][userChoice]

    console.log('/review for quizzlet', {
        student,
        pastAnswers,
        nextPage,
        lastPage,
        qna,
        rest,
        userChoice,
        userAnswer,
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
        aspectRatio: '1:1',
        component: lastPage
            ? ResultsView('j', {})
            : ReviewAnswersView({ qnas, qna, colors, userAnswer, ...rest }),
        functionName: lastPage ? 'results' : 'review',
        params: lastPage ? { currentPage: nextPage } : undefined,
    }
}
