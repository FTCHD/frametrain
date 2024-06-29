'use client'

import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '../..'
import { useState } from 'react'
import QnaForm from './QnaForm'
import { Button } from '@/components/shadcn/Button'
import { Trash } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/shadcn/Dialog'

export default function Questions() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [open, setOpen] = useState(false)
    const [currentQna, setCurrentQna] = useState<Config['qna'][number] | null>(null)

    return (
        <div className="flex flex-col gap-4 w-full">
            {config.qna.length === 0 && (
                <div className="flex flex-row gap-2 w-full">
                    <h1 className="text-2xl font-semibold">
                        No questions added. Check the "Question & Answer" tab to add a new one
                    </h1>
                </div>
            )}
            {config.qna.map((qna, index) => (
                <div
                    key={index}
                    className="flex flex-row gap-2 justify-between items-center w-full h-full"
                >
                    <div className="flex flex-row gap-2 justify-center items-center h-full">
                        <span className="flex flex-col justify-center items-center font-bold text-black bg-white rounded-full min-w-12 min-h-12">
                            # {index + 1}
                        </span>
                        <p className="font-muet">
                            {qna.question.length > 10
                                ? qna.question.substring(0, 10) +
                                  '...' +
                                  qna.question.substring(qna.question.length - 10)
                                : qna.question}
                        </p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                setCurrentQna(qna)
                                setOpen(true)
                            }}
                        >
                            EDIT
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                updateConfig({
                                    qna: config.qna.filter((q) => q.index !== qna.index),
                                })
                            }
                        >
                            <Trash />
                        </Button>
                    </div>
                </div>
            ))}
            {currentQna && (
                <>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="p-1 max-w-2xl">
                            <div className="flex-1 h-full">
                                <QnaForm
                                    mode="update"
                                    qna={currentQna}
                                    className="overflow-y-scroll overflow-x-hidden h-screen px-2 pt-4"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    )
}
