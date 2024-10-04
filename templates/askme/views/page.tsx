'use client'
import { useFrameConfig, useFrameStorage } from '@/sdk/hooks'
import { useState } from 'react'
import { handleAnswerSubmission } from '../handler'
import type { Question } from '../types'
import type { Config, Storage } from '..'

export default function Page() {
    const [config] = useFrameConfig<Config>()
    const [storage, setStorage] = useFrameStorage<Storage>()
    const [answerText, setAnswerText] = useState('')
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

    const handleAnswer = async (question: Question) => {
        if (answerText) {
            const updatedStorage = await handleAnswerSubmission(
                { untrustedData: { fid: 0, username: '' } } as any,
                config,
                storage,
                question.id,
                answerText
            )
            setStorage(updatedStorage)
            setAnswerText('')
            setSelectedQuestion(null)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Questions and Answers</h1>
            {storage.questions.map((question) => (
                <div key={question.id} className="mb-4 p-4 border rounded shadow-sm">
                    <p className="font-semibold">Q: {question.text}</p>
                    <p className="text-sm text-gray-600">Asked by: @{question.username}</p>
                    {question.answer ? (
                        <p className="mt-2 text-green-600">A: {question.answer}</p>
                    ) : (
                        <>
                            {selectedQuestion?.id === question.id ? (
                                <div className="mt-2">
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
                                        placeholder="Type your answer here..."
                                    />
                                    <div className="mt-2 flex space-x-2">
                                        <button
                                            onClick={() => handleAnswer(question)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Submit Answer
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedQuestion(null)
                                                setAnswerText('')
                                            }}
                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedQuestion(question)}
                                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                >
                                    Answer
                                </button>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}
