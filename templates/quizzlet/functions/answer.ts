'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import { choicesRepresentation } from '../utils'
import QuestionView from '../views/Question'
import ResultsView from '../views/Results'

export default async function answer(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const choice = body.untrustedData.buttonIndex
    const pastAnswers = state.answers?.[student] ?? []

    let newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const currentPage = nextPage - 1
    const lastPage = nextPage === qnaCount
    const qna = config.qna[currentPage]
    const nextQna = config.qna[nextPage]
    const { qna: qnas, ...rest } = config

    const buttons: FrameButtonMetadata[] = []

    pastAnswers.push({ questionIndex: qna.index, answerIndex: choice })

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
        buttons.push(
            {
                label: '← Home',
            },
            {
                label: 'My Answers',
            },
            { label: 'Create Your Own', action: 'link', target: 'https://frametra.in' }
        )
    }

    const correctAnswers = pastAnswers.reduce((acc, answer) => {
        const qna = config.qna[answer.questionIndex - 1]
        const choice =
            choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][answer.answerIndex - 1]
        if (qna.answer === choice) {
            return acc + 1
        }
        return acc
    }, 0)

    const wrongAnswers = pastAnswers.length - correctAnswers
    const percentages = {
        correct_answers: Math.round((correctAnswers / config.qna.length) * 100),
        wrong_answers: Math.round((wrongAnswers / config.qna.length) * 100),
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
        component: lastPage
            ? ResultsView(
                  config.qna.length,
                  percentages,
                  {
                      correct_answers: correctAnswers,
                      wrong_answers: wrongAnswers,
                  },
                  colors
              )
            : QuestionView({ qnas, qna: nextQna, ...rest }),
        functionName: lastPage ? 'results' : 'answer',
        params: lastPage ? undefined : { currentPage: nextPage },
    }
}
