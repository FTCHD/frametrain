'use client'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'
import type { Question } from '../types'

export default function QuestionView({ config, question }: { config: Config; question: Question }) {
    return (
        <BasicView
            title="Question"
            subtitle={question.text}
            bottomMessage={`Asked by @${question.username}`}
        />
    )
}
