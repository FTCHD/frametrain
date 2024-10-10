'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { runGatingChecks } from '@/lib/gating'
import { chains, createGlideConfig, createSession, currencies } from '@paywithglide/glide-js'
import { v4 as uuidv4 } from 'uuid'
import type { Config, Question, Storage, ViewType, Payment } from './types'
import * as Views from './views'

const glideConfig = createGlideConfig({
    projectId: process.env.GLIDE_PROJECT_ID!,
    chains: [chains.base],
})

export default async function handler(
    body: FramePayloadValidated,
    config: Config,
    storage: Storage
): Promise<BuildFrameData> {
    runGatingChecks(body, config.gating)

    const viewType = determineViewType(body)
    const question = findRelevantQuestion(storage, body)

    if (
        viewType === 'question' &&
        config.paymentEnabled &&
        !hasUserPaid(storage, body.untrustedData.fid, question?.id)
    ) {
        return await handlePaymentFlow(body, config)
    }

    return renderView(viewType, config, storage, body, question)
}

function determineViewType(body: FramePayloadValidated): ViewType {
    const { buttonIndex, inputText } = body.untrustedData

    if (inputText) return 'submitted'
    if (buttonIndex === 1) return 'question'
    if (buttonIndex === 2) return 'answer'
    if (buttonIndex === 3) return 'answered'
    return 'cover'
}

function findRelevantQuestion(storage: Storage, body: FramePayloadValidated): Question | undefined {
    const questionId = body.untrustedData.state?.currentQuestionId
    if (!questionId) {
        const userQuestions = storage.questions.filter((q) => q.fid === body.untrustedData.fid)
        return userQuestions.sort((a, b) => b.timestamp - a.timestamp)[0]
    }
    return storage.questions.find((q) => q.id === questionId)
}

function hasUserPaid(storage: Storage, fid: number, questionId?: string): boolean {
    if (!questionId) return false
    return storage.payments.some(
        (payment) => payment.fid === fid && payment.questionId === questionId
    )
}

async function handlePaymentFlow(
    body: FramePayloadValidated,
    config: Config
): Promise<BuildFrameData> {
    const session = await createSession(glideConfig, {
        chainId: chains.base.id,
        account: body.untrustedData.address,
        paymentCurrency: currencies.usdc.on(chains.base),
        paymentAmount: config.paymentAmount,
        address: config.paymentAddress,
    })

    return {
        buttons: [{ label: 'Pay to View Answer', action: 'tx' }],
        transaction: {
            chainId: `eip155:${chains.base.id}`,
            method: 'eth_sendTransaction',
            params: session.unsignedTransaction,
        },
    }
}

function renderView(
    viewType: ViewType,
    config: Config,
    storage: Storage,
    body: FramePayloadValidated,
    question?: Question
): BuildFrameData {
    const buttons = getButtonsForView(viewType, config, question)

    return {
        buttons,
        component: {
            type: viewType,
            props: { config, question, storage, body },
        },
    }
}

function getButtonsForView(
    viewType: ViewType,
    config: Config,
    question?: Question
): Array<{ label: string; action: string; target?: string }> {
    switch (viewType) {
        case 'cover':
            return [
                { label: 'Ask a Question', action: 'post' },
                { label: 'View Questions', action: 'post' },
            ]
        case 'question':
            return [
                { label: 'View Answer', action: 'post' },
                { label: 'Back', action: 'post' },
            ]
        case 'answer':
        case 'answered':
            return [
                { label: 'Back', action: 'post' },
                {
                    label: 'Share',
                    action: 'post_redirect',
                    target: `warpcast://action?text=${encodeURIComponent(
                        `Got an answer from @${config.username}: ${question?.text}`
                    )}`,
                },
            ]
        case 'submitted':
            return [{ label: 'Back to Cover', action: 'post' }]
        default:
            return [{ label: 'Ask a Question', action: 'post' }]
    }
}

export async function handleQuestionSubmission(
    body: FramePayloadValidated,
    config: Config,
    storage: Storage
): Promise<Storage> {
    const newQuestion: Question = {
        id: uuidv4(),
        text: body.untrustedData.inputText || '',
        fid: body.untrustedData.fid,
        username: body.untrustedData.username || '',
        timestamp: Date.now(),
    }

    return {
        ...storage,
        questions: [...storage.questions, newQuestion],
    }
}

export async function handleAnswerSubmission(
    body: FramePayloadValidated,
    config: Config,
    storage: Storage,
    questionId: string,
    answer: string
): Promise<Storage> {
    const updatedQuestions = storage.questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
    )

    return {
        ...storage,
        questions: updatedQuestions,
    }
}

export async function handlePayment(
    body: FramePayloadValidated,
    config: Config,
    storage: Storage,
    questionId: string
): Promise<Storage> {
    const newPayment: Payment = {
        questionId,
        fid: body.untrustedData.fid,
        timestamp: Date.now(),
    }

    return {
        ...storage,
        payments: [...storage.payments, newPayment],
    }
}
