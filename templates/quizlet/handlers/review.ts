'use server'

import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ReviewAnswersView from '../views/Review'

export default async function review({
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
    const fid = body.interactor.fid.toString()
    const pastAnswers = storage.answers?.[fid] ?? []

    const newStorage = storage
    const currentPage = params?.currentPage === undefined ? 0 : Number.parseInt(params?.currentPage)
    const nextPage = currentPage > 0 ? currentPage + 1 : 1
    const lastPage = currentPage === config.qna.length
    const quizId = `${params?.quizId}`

    const buttons: FrameButtonMetadata[] = []

    const qna = config.qna[currentPage - 1]

    const { qna: qnas } = config

    const foundChoice = pastAnswers.find((a) => a.questionIndex === qna.index)
    const userAnswer = foundChoice!.answer

    const correctAnswers = pastAnswers.reduce((acc, past) => {
        const qna = config.qna[past.questionIndex]

        return qna.answer === past.answer ? acc + 1 : acc
    }, 0)

    const showImage = correctAnswers === config.qna.length
    const webhooks: NonNullable<BuildFrameData['webhooks']> = []

    if (lastPage) {
        webhooks.push({
            event: 'quiz.results',
            data: {
                id: quizId,
                fid,
                total_questions: config.qna.length,
                first_qna: { question: config.qna[0].question, answer: config.qna[0].answer },
                last_qna: {
                    question: config.qna[config.qna.length - 1].question,
                    answer: config.qna[config.qna.length - 1].answer,
                },
                correct_answers: correctAnswers,
                wrong_answers: config.qna.length - correctAnswers,
                cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
            },
        })
        buttons.push({
            label: '← Home',
        })

        if (showImage) {
            if (config.success.image) {
                buttons.push({
                    label: 'Rewards',
                })
            }
        }
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    } else {
        buttons.push({ label: '→' })
    }

    const fonts = await loadGoogleFontAllVariants(qna.design?.qnaFont ?? 'Roboto')

    return {
        buttons,
        storage: newStorage,
        fonts,
        component: ReviewAnswersView({ total: qnas.length, qna, userAnswer }),
        handler: lastPage ? 'success' : 'review',
        params: !lastPage ? { currentPage: nextPage } : undefined,
        webhooks,
    }
}
