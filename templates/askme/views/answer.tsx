'use client'
import BasicView from '@/sdk/views/BasicView'
import type { Config } from '..'
import type { Question } from '../types'

export default function AnswerView({ config, question }: { config: Config; question: Question }) {
    return (
        <BasicView
            title="Answer"
            subtitle={question.answer || 'No answer yet.'}
            bottomMessage={`Question: ${question.text}`}
        />
    )
}
