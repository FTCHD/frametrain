'use server'
import type { frameTable } from '@/db/schema'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from 'drizzle-kit'
import type { InferSelectModel } from 'drizzle-orm'
import type { Question, Storage } from '..'

export default async function cover({
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
    params: any
}): Promise<BuildFrameData> {
    const buttonIndex = body.tapped_button.index

    const isOwner = frame.owner === body.interactor.fid.toString()

    if (buttonIndex === 1) {
        // determine if interactor is user or viewer
        // return the question with "home" and "answer" (if user), "back", and "next" buttons
        // return input field if user

        const firstQuestion = storage?.questions?.[0]

        if (!firstQuestion) {
            throw new FrameError('No questions yet!')
        }

        console.log('firstQuestion', firstQuestion)

        return {
            buttons: [
                {
                    label: 'Home',
                },
                isOwner && !firstQuestion.answer
                    ? {
                          label: 'Answer',
                      }
                    : {
                          label: 'View Answer',
                      },
                {
                    label: '←',
                },
                {
                    label: '→',
                },
            ],
            inputText: isOwner ? 'Answer' : undefined,
            component: BasicView({
                title: {
                    text: firstQuestion.question,
                },
                subtitle: {
                    text: `Asked by ${firstQuestion.userName}`,
                },
            }),
            handler: 'question',
            params: {
                question: 0,
            },
        }
    }

    if (buttonIndex === 2) {
        // if (isOwner) {
        //     throw new FrameError('You cannot submit a question to your own frame ):')
        // }

        const inputText = body.input?.text

        if (!inputText) {
            throw new FrameError('No input text')
        }

        const newQuestion: Question = {
            userId: body.interactor.fid.toString(),
            userName: body.interactor.username,
            userIcon: body.interactor.pfp_url,
            question: inputText,
            askedAt: new Date(),
        }

        const newStorage = {
            ...storage,
            questions: [...(storage.questions || []), newQuestion],
        }

        // get the input value
        // do not let the viewer submit an empty question or let the user submit a question to their own frame
        // save to storage
        // return the question view with "back" and "view questions" buttons

        return {
            buttons: [
                {
                    label: 'Back',
                },
            ],
            component: BasicView({
                title: {
                    text: 'Question Submitted',
                },
                subtitle: {
                    text: 'Your question has been submitted and will be answered soon.',
                },
            }),
            handler: 'question',
            storage: newStorage,
        }
    }

    throw new FrameError('Invalid button index')
}
