'use server'

import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { choicesRepresentation } from '../utils'
import QuestionView from '../views/Question'
import ResultsView from '../views/Results'

export default async function answer({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const student = body.interactor.fid.toString()
    const choice = body.tapped_button.index - 1
    const pastAnswers = storage.answers?.[student] ?? []

    let newStorage = storage
    const nextPage = params?.currentPage !== undefined ? Number(params?.currentPage) + 1 : 1
    const qnaCount = config.qna.length
    const lastPage = nextPage === qnaCount
    const qna = config.qna[nextPage - 1]
    const nextQna = config.qna[nextPage]
    const choiceType = isNaN(Number.parseInt(qna.answer)) ? 'alpha' : 'numeric'
    const userAnswer = choicesRepresentation[choiceType][choice]
    const quizIdsFromStorage = storage.quizIds || []
    const quizId = `${params?.quizId}`
    const currentQuizId = quizIdsFromStorage.find((id) => id === quizId)
        ? quizId
        : `${student}:${body.cast.hash}_${crypto.randomUUID().replaceAll('-', '')}`
    const quizIds = new Set([...quizIdsFromStorage, currentQuizId])

    const buttons: FrameButtonMetadata[] = []
    const webhooks: NonNullable<BuildFrameData['webhooks']> = []

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
        newStorage = {
            ...storage,
            quizIds: [...quizIds],
            answers: {
                ...(storage.answers ?? {}),
                [student]: updatedAnswers,
            },
        }
    } else {
        pastAnswers.push({ questionIndex: qna.index, answer: userAnswer })
        newStorage = Object.assign(storage, {
            quizIds: [...quizIds],
            answers: {
                ...(storage.answers ?? {}),
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

    webhooks.push({
        event: 'quiz.qna',
        data: {
            id: quizId,
            fid: student,
            total_questions: config.qna.length,
            question_number: nextPage - 1,
            question: qna.question,
            answer: qna.answer,
            user_answer: userAnswer,
            cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
        },
    })

    const updatedAnswers = newStorage.answers[student]

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
        storage: newStorage,
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
        handler: lastPage ? 'results' : 'answer',
        params: lastPage ? { quizId: currentQuizId } : { currentPage: nextPage },
        webhooks,
    }
}
