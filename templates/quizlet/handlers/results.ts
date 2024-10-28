'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ReviewAnswersView from '../views/Review'
import initial from './initial'

export default async function results({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params?: any
}): Promise<BuildFrameData> {
    const userId = body.interactor.fid.toString()
    const choice = body.tapped_button.index

    if (choice === 1) {
        return initial({ config })
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const { qna: qnas } = config
    const qna = qnas[0]

    const userAnswer = storage.answers[userId][qna.index].answer

    return {
        buttons: [{ label: '→' }],
        fonts: roboto,
        component: ReviewAnswersView({ qna, total: qnas.length, userAnswer }),
        aspectRatio: '1.91:1',
        handler: 'review',
        params: { currentPage: 1, quizId: params?.quizId },
    }
}
