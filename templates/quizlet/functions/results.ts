'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import ReviewAnswersView from '../views/Review'
import initial from './initial'

export default async function results(
    body: FrameActionPayload,
    config: Config,
    storage: Storage,
    _params: any
): Promise<BuildFrameData> {
    const userId = body.untrustedData.fid.toString()
    const choice = body.untrustedData.buttonIndex

    if (choice === 1) {
        return initial(config, storage)
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const { qna: qnas } = config
    const qna = qnas[0]

    const userAnswer = storage.answers[userId][qna.index].answer

    return {
        buttons: [{ label: '→' }],
        fonts: roboto,
        component: ReviewAnswersView({ qna, total: qnas.length, userAnswer }),
        handler: 'review',
        params: { currentPage: 1 },
    }
}
