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
    const fid = body.interactor.fid.toString()
    const qna = config.qna[0]
    const fonts = await loadGoogleFontAllVariants(qna.design?.qnaFont ?? 'Roboto')
    const buttons: FrameButtonMetadata[] = []
    const pastAnswers = storage.answers?.[fid] ?? []
    const scores = { yes: 0, no: 0 }
    const quizId = `${fid}:${body.cast.hash}_${crypto.randomUUID().replaceAll('-', '')}`
    const quizIds = storage.ids || []
    let newStorage = storage

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
    newStorage = {
        ...storage,
        quizIds: [...quizIds, quizId],
    }

    const webhooks: NonNullable<BuildFrameData['webhooks']> = []

    webhooks.push({
        event: 'quiz.initialize',
        data: {
            id: quizId,
            fid,
            total_questions: config.qna.length,
            previously_participated: pastAnswers.length > 0,
            cast_url: `https://warpcast.com/~/conversations/${body.cast.hash}`,
        },
    })

    return {
        buttons,
        fonts,
        component: config.answerOnce
            ? ResultsView(config.qna.length, scores, config)
            : QuestionView({ qna, total: config.qna.length }),
        handler: config.answerOnce ? 'results' : 'answer',
        params: !config.answerOnce ? { quizId } : undefined,
        webhooks,
        storage: newStorage,
    }
}
