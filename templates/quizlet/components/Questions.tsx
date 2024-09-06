'use client'
import { Drawer, DrawerClose, DrawerContent } from '@/components/shadcn/Drawer'
import { Button } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { TrashIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import type { Config } from '../'
import QnaForm from './QnaForm'

export default function Questions() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [open, setOpen] = useState(false)
    const [currentQna, setCurrentQna] = useState<Config['qna'][number] | null>(null)

    return (
        <>
            {config.qna.length === 0 && (
                <div className="flex flex-row gap-2 w-full">
                    <h1 className="text-2xl font-semibold">
                        Tap the "Add Question" tab to add a Question!
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
                            <TrashIcon />
                        </Button>
                    </div>
                </div>
            ))}
            {currentQna && (
                <>
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerContent>
                            <div className="flex-1 h-full">
                                <QnaForm
                                    mode="update"
                                    qna={currentQna}
                                    className="overflow-y-scroll overflow-x-hidden h-screen px-2 pt-4"
                                />
                            </div>
                            <DrawerClose className="absolute right-8 top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <XIcon className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </DrawerClose>
                        </DrawerContent>
                    </Drawer>
                </>
            )}
        </>
    )
}
