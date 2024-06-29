'use server'

import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import ReviewAnswersView from '../views/Review'

export default async function review(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const student = body.untrustedData.fid.toString()
    const pastAnswers = state.answers?.[student] ?? []

    const newState = state
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
        state: newState,
        fonts,
        component: ReviewAnswersView({ total: qnas.length, qna, userAnswer }),
        functionName: lastPage ? 'success' : 'review',
        params: !lastPage ? { currentPage: nextPage } : undefined,
    }
}
