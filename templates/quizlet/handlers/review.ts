'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ReviewAnswersView from '../views/Review'

export default async function review({
    body,
    config,
    storage,
    params,
}: {
    body: FrameActionPayload
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const pastAnswers = storage.answers?.[student] ?? []

    const newStorage = storage
    const currentPage = params?.currentPage === undefined ? 0 : Number.parseInt(params?.currentPage)
    const nextPage = currentPage > 0 ? currentPage + 1 : 1
    const lastPage = currentPage === config.qna.length

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
    if (lastPage) {
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
    }
}
