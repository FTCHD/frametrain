'use server'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import QuestionView from '../views/Question'
import ResultsView from '../views/Results'

export default async function page({
    body,
    config,
    storage,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
}): Promise<BuildFrameData> {
    const user = body.interactor.fid.toString()
    const qna = config.qna[0]
    const fonts = await loadGoogleFontAllVariants(qna.design?.qnaFont ?? 'Roboto')
    const buttons: FrameButtonMetadata[] = []
    const pastAnswers = storage.answers?.[user] ?? []
    const scores = { yes: 0, no: 0 }

    if (config.answerOnce) {
        scores.yes = pastAnswers.reduce((acc, past) => {
            const qna = config.qna[past.questionIndex]
            return qna.answer === past.answer ? acc + 1 : acc
        }, 0)

        scores.no = pastAnswers.reduce((acc, past) => {
            const qna = config.qna[past.questionIndex]

            return qna.answer !== past.answer ? acc + 1 : acc
        }, 0)

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
    } else {
        for (const label of qna.choices) {
            buttons.push({ label })
        }
    }

    return {
        buttons,
        fonts,
        component: config.answerOnce
            ? ResultsView(config.qna.length, scores, config)
            : QuestionView({ qna, total: config.qna.length }),
        handler: config.answerOnce ? 'results' : 'answer',
        params: config.answerOnce ? { currentPage: 1 } : undefined,
    }
}
