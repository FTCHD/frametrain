'use server'
import type { frameTable } from '@/db/schema'
import type { BuildFrameData, FrameButtonMetadata, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import BasicView from '@/sdk/views/BasicView'
import type { InferSelectModel } from 'drizzle-orm'
import type { Config, Storage } from '..'
import initial from './initial'

export default async function question({
    frame,
    body,
    config,
    storage,
    params,
}: {
    frame: Pick<InferSelectModel<typeof frameTable>, 'id' | 'owner'>
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { question: unknown; flash?: string | undefined }
}): Promise<BuildFrameData> {
    // used by the user to answer a question
    // used by the visitor to see the answer

    const buttonIndex = body.tapped_button.index

    const isOwner = frame.owner === body.interactor.fid.toString()

    if (buttonIndex === 1) {
        // "Home" button
        return initial({ body: undefined, config, storage, params })
    }

    const questionIndex = Number.parseInt(params.question as string)

    if (isOwner && buttonIndex === 2) {
        // "Answer" button

        // save answer to db
        // show basic view with "Home" button

        const question = storage?.questions?.[questionIndex]

        if (!question) {
            throw new FrameError('Question not found')
        }

        if (!question.answer) {
            const answer = body.input?.text

            if (!answer) {
                throw new FrameError('No answer provided')
            }

            return {
                buttons: [{ label: 'Home' }],
                aspectRatio: '1:1',
                component: BasicView({
                    title: {
                        text: 'Answered',
                    },
                    subtitle: {
                        text: answer,
                    },
                }),
                handler: 'initial',
                storage: {
                    questions: storage?.questions?.map((q, index) =>
                        index === questionIndex ? { ...q, answer } : q
                    ),
                },
                params: {
                    question: questionIndex,
                    flash: 'You have answered this question!',
                },
            }
        }
    }

    const isFirstQuestion = questionIndex === 0
    const isLastQuestion = questionIndex === storage?.questions?.length - 1

    if (buttonIndex === 2) {
        // "View Answer" button

        const question = storage?.questions?.[questionIndex]

        if (!question) {
            throw new FrameError('Question not found')
        }

        const answer = question.answer

        if (!answer) {
            throw new FrameError('Not answered yet!')
        }

        console.log('got HERE!')

        return {
            buttons: [
                {
                    label: 'Home',
                },
                // this means buttonIndex 2 will be a link in this case,
                // so it won't trigger the same buttonIndex on this `question` handler
                {
                    label: 'Share',
                    action: 'link',
                    target: 'https://warpcast.com/farcaster/ama',
                },
                {
                    label: '←',
                },
                {
                    label: '→',
                },
            ],
            component: BasicView({
                title: {
                    text: question.question,
                },
                subtitle: {
                    text: `Answer: ${question.answer}`,
                },
            }),
            handler: 'question',
            params: {
                question: questionIndex,
            },
        }
    }

    if (buttonIndex === 3) {
        // "←" button

        console.log('isFirstQuestion', isFirstQuestion)
        console.log('questionIndex', questionIndex)

        if (isFirstQuestion) {
            throw new FrameError('No previous question')
        }

        const previousQuestionIndex = questionIndex - 1
        const previousQuestion = storage?.questions?.[previousQuestionIndex]

        const buttons: FrameButtonMetadata[] = [
            {
                label: 'Home',
            },
        ]

        if (isOwner) {
            buttons.push({
                label: 'Answer',
            })
        }
        return {
            buttons: [
                ...buttons,
                {
                    label: '←',
                },
                {
                    label: '→',
                },
            ],
            component: BasicView({
                title: {
                    text: previousQuestion.question,
                },
                subtitle: {
                    text: `Asked by ${previousQuestion.userName}`,
                },
            }),
            handler: 'question',
            params: {
                question: previousQuestionIndex,
            },
        }
    }

    if (buttonIndex === 4) {
        // "→" button

        if (isLastQuestion) {
            throw new FrameError('No next question')
        }

        const nextQuestionIndex = questionIndex + 1
        const nextQuestion = storage?.questions?.[nextQuestionIndex]

        const buttons: FrameButtonMetadata[] = [
            {
                label: 'Home',
            },
        ]

        if (isOwner) {
            buttons.push({
                label: 'Answer',
            })
        }
        return {
            buttons: [
                ...buttons,
                {
                    label: '←',
                },
                {
                    label: '→',
                },
            ],
            component: BasicView({
                title: {
                    text: nextQuestion.question,
                },
                subtitle: {
                    text: `Asked by ${nextQuestion.userName}`,
                },
            }),
            handler: 'question',
            params: {
                question: nextQuestionIndex,
            },
        }
    }

    throw new FrameError('Invalid action')
}
