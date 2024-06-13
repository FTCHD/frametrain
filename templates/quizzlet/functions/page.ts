'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import AnswerView from '../views/Answer'
import { choicesRepresentation } from '../utils'

export default async function page(
    body: FrameActionPayload,
    { qna: qnas, ...config }: Config,
    state: State,
    _params: any
): Promise<BuildFrameData> {
    const user = body.untrustedData.fid.toString()
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const qna = qnas[0]
    const choiceType = qna.isNumeric ? 'numeric' : 'alpha'
    const buttons: FrameButtonMetadata[] = []

    // reset user state
    const newState = {
        ...state,
        answers: {
            ...state.answers,
            [user]: [],
        },
    }

    const choices = Array.from({ length: qna.choices })

    // loop through each choices and use their index to get the label representation
    choices.forEach((_, choice) => {
        buttons.push({ label: choicesRepresentation[choiceType][choice] })
    })

    return {
        state: newState,
        buttons,
        fonts: roboto,
        aspectRatio: '1.91:1',
        component: AnswerView({ qna, qnas, ...config }),
        functionName: 'answer',
    }
}
