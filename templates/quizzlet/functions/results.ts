'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import type { Config, State } from '..'
import { choicesRepresentation } from '../utils'
import ResultsView from '../views/Results'

export default async function results(
    body: FrameActionPayload,
    config: Config,
    state: State,
    _params: any
): Promise<BuildFrameData> {
    const user = body.untrustedData.fid.toString()
    const allAnswers = state.answers?.[user] ?? []

    const buttons: FrameButtonMetadata[] = [
        {
            label: 'Reset',
        },
    ]

    const correctChoices = allAnswers.filter((answer) => {
        const qna = config.qna[answer.questionIndex]
        return qna
            ? qna.answer ===
                  choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][answer.answerIndex]
            : false
    })
    const correctAnswers = correctChoices.length
    const wrongAnswers = allAnswers.length - correctAnswers
    const showImage = correctAnswers === config.qna.length
    const percentages = {
        correct: Math.round((correctAnswers / config.qna.length) * 100),
        wrong: Math.round((wrongAnswers / config.qna.length) * 100),
    }
    const ok = correctAnswers === config.qna.length

    console.log('/results for quizzlet >> ok', ok)

    if (!showImage) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    } else {
        if (config.success.href && config.success.label && config.success.image) {
            buttons.push({
                label: 'A Gift For you',
                // action: 'function',
                // target: 'initial',
            })
        }
    }

    const colors = {
        background: config?.background,
        textColor: config?.textColor,
        barColor: config?.barColor,
    }

    return {
        buttons,
        component: ResultsView(
            config.qna.length,
            percentages,
            {
                correct_answers: correctAnswers,
                wrong_answers: wrongAnswers,
            },
            colors
        ),
        functionName: showImage ? undefined : 'success',
        state,
    }
}
