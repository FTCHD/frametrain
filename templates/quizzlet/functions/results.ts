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

    const correctAnswers = allAnswers.reduce((acc, answer) => {
        const qna = config.qna[answer.questionIndex - 1]
        const choice =
            choicesRepresentation[qna.isNumeric ? 'numeric' : 'alpha'][answer.answerIndex - 1]
        if (qna.answer === choice) {
            return acc + 1
        }
        return acc
    }, 0)

    const wrongAnswers = allAnswers.length - correctAnswers
    const showImage = correctAnswers === config.qna.length
    const percentages = {
        correct_answers: Math.round((correctAnswers / config.qna.length) * 100),
        wrong_answers: Math.round((wrongAnswers / config.qna.length) * 100),
    }

    if (!showImage) {
        buttons.push({
            label: 'Create Your Own',
            action: 'link',
            target: 'https://frametra.in',
        })
    } else {
        if (config.success.image) {
            buttons.push({
                label: 'A Gift For you',
            })
        } else {
            buttons.push({
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
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
        functionName: 'success',
        state,
    }
}
