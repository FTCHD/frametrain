'use client'
import { Button } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { useEffect, useState } from 'react'
import type { Config } from '../..'
import QnaForm from './QnaForm'

type QNA = Config['qna'][number]

export default function Qna() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [currentQna, setCurrentQna] = useState<Config['qna'][number] | null>(null)
    const [loaded, setLoaded] = useState(false)
    const defaultQna: QNA = {
        index: config.qna.length,
        question: 'First question',
        answer: 'C',
        answers: 'Choose the correct answer: A, B, C, D',
        choices: ['A', 'B', 'C', 'D'],
        design: {
            questionSize: '20px',
            questionColor: 'white',
            answersSize: '20px',
            answersColor: 'white',
            qnaFont: 'Roboto',
            qnaStyle: 'normal',
            barColor: 'yellow',
            backgroundColor: '#09203f',
            reviewSize: '20px',
            reviewColor: 'rgba(255, 255, 255, 0.6)',
            reviewBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    }

    useEffect(() => {
        setCurrentQna(config.qna[config.currentQnaIndex] || null)
        setLoaded(true)
    }, [config.qna, config.currentQnaIndex])

    return loaded ? (
        currentQna && config.currentQnaIndex === currentQna.index ? (
            <QnaForm
                qna={currentQna}
                mode="create"
                onContinue={(index) => {
                    updateConfig({
                        qna: [...config.qna, defaultQna],
                        currentQnaIndex: index + 1,
                    })
                    setCurrentQna({
                        ...defaultQna,
                        index: index + 1,
                    })
                }}
            />
        ) : (
            <div className="flex flex-col w-full h-full mb-4">
                <Button
                    onClick={() => {
                        updateConfig({
                            qna: [...config.qna, defaultQna],
                            currentQnaIndex: defaultQna.index,
                        })
                        setCurrentQna(defaultQna)
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Add a new Question & Answer
                </Button>
            </div>
        )
    ) : null
}
