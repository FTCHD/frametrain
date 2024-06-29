'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import QuestionView from '../views/Question'
import ResultsView from '../views/Results'
import { choicesRepresentation } from '../utils'

export default async function answer(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const choice = body.untrustedData.buttonIndex - 1
    const pastAnswers = state.answers?.[student] ?? []

    let newState = state
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const lastPage = nextPage === qnaCount
    const qna = config.qna[nextPage - 1]
    const nextQna = config.qna[nextPage]
    const choiceType = isNaN(Number.parseInt(qna.answer)) ? 'alpha' : 'numeric'
    const userAnswer = choicesRepresentation[choiceType][choice]

    const buttons: FrameButtonMetadata[] = []

    // if the user has already answered this question, find the previous answers and
    // if the user has answered it more than once, keep the latest answer and remove the previous ones
    // update the old answer with the new one
    // else, add a new answer to the list
    const existingAnswers = pastAnswers.filter((a) => a.questionIndex === qna.index)
    if (existingAnswers.length > 0) {
        const latestAnswer = existingAnswers[existingAnswers.length - 1]
        let updatedAnswers = pastAnswers.filter((a) => a.questionIndex !== qna.index)
        if (latestAnswer.answer !== userAnswer) {
            updatedAnswers.push({ questionIndex: qna.index, answer: userAnswer })
        } else {
            updatedAnswers = [latestAnswer, ...updatedAnswers]
        }
        newState = {
            ...state,
            answers: {
                ...(state.answers ?? {}),
                [student]: updatedAnswers,
            },
        }
    } else {
        pastAnswers.push({ questionIndex: qna.index, answer: userAnswer })
        newState = Object.assign(state, {
            answers: {
                ...(state.answers ?? {}),
                [student]: pastAnswers,
            },
        })
    }

    if (!lastPage) {
        for (const label of qna.choices) {
            buttons.push({ label })
        }
    } else {
        const user = config.fids.find((fid) => fid === student)
        if (!user) {
            config.fids.push(student)
        }

        buttons.push(
            {
                label: '← Home',
            },
            {
                label: 'My Answers',
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            }
        )
    }

    const updatedAnswers = newState.answers[student]

    const correctAnswers = updatedAnswers.reduce((acc, past) => {
        const qna = config.qna[past.questionIndex]
        return qna.answer === past.answer ? acc + 1 : acc
    }, 0)

    const wrongAnswers = updatedAnswers.reduce((acc, past) => {
        const qna = config.qna[past.questionIndex]

        return qna.answer !== past.answer ? acc + 1 : acc
    }, 0)

    const fonts = await loadGoogleFontAllVariants(qna.design?.qnaFont ?? 'Roboto')

    return {
        buttons,
        state: newState,
        fonts,
        component: lastPage
            ? ResultsView(
                  config.qna.length,
                  {
                      yes: correctAnswers,
                      no: wrongAnswers,
                  },
                  config
              )
            : QuestionView({ qna: nextQna, total: qnaCount }),
        functionName: lastPage ? 'results' : 'answer',
        params: lastPage ? undefined : { currentPage: nextPage },
    }
}
