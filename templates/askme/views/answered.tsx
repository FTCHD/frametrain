'use client'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'
import type { Question } from '../types'

export default function AnsweredView({ config, question }: { config: Config; question: Question }) {
    return (
        <BasicView
            title="Your answer has been submitted"
            subtitle={`Q: ${question.text}\nA: ${question.answer}`}
            bottomMessage="Share your answer!"
        />
    )
}
