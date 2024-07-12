'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import ReviewAnswersView from '../views/Review'
import initial from './initial'

export default async function results(
    body: FrameActionPayload,
    config: Config,
    state: State,
    _params: any
): Promise<BuildFrameData> {
    const userId = body.untrustedData.fid.toString()
    const choice = body.untrustedData.buttonIndex

    if (choice === 1) {
        return initial(config, state)
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    const { qna: qnas } = config
    const qna = qnas[0]

    const userAnswer = state.answers[userId][qna.index].answer

    return {
        buttons: [{ label: '→' }],
        fonts: roboto,
        state,
        component: ReviewAnswersView({ qna, total: qnas.length, userAnswer }),
        handler: 'review',
        params: { currentPage: 1 },
    }
}
