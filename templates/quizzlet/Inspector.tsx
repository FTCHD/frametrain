'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import type { Config } from '.'
import { ColorPicker } from '@/sdk/components'
import { Textarea } from '@/components/shadcn/Textarea'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Label } from '@/components/shadcn/InputLabel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/Select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/shadcn/Accordion'
import { Separator } from '@/components/shadcn/Separator'
import { Dialog, DialogContent } from '@/components/shadcn/Dialog'
import { ScrollArea } from '@/components/shadcn/ScrollArea'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/shadcn/Drawer'
import { choicesRepresentation } from './utils'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [currentQna, setCurrentQna] = useState<Config['qna'][number] | null>(null)
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [open, setOpen] = useState(false)
    const [choicesType, setChoicesType] = useState<"alpha" | "numeric" | null>(null)
    const [choices, setChoices] = useState<number>(0)
    const [showChoices, setShowChoices] = useState<boolean>(false)

    useEffect(() => {
        console.log('choices', { choices, choicesType })
        if (choices > 1 && choicesType) {
            setShowChoices(true)
        }
    }, [choices, choicesType])

    return (
        <>
            <div className="w-full h-full flex flex-col gap-5">
                <p>{JSON.stringify({ config, answer, question, choicesType })}</p>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col space-y-1">
                            <h2 className="text-2xl tracking-tight font-semibold">Set your Question</h2>
                            <p className='text-sm text-muted-foreground'>Don't forget to include the list of posible answers after asking the question()</p>
                        </div>
                        <Textarea
                            placeholder={`
                                What is the current popular coin on Farcaster?
                                A. Higher
                                B. Ethereum
                                C. Degen
                                D. Shiba Inu
                            `}
                            className="w-full"
                            defaultValue={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>
                    {
                        question.length > 10 && (
                            <>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-col space-y-1">
                                        <h2 className="text-2xl tracking-tight font-semibold">How many possible answers?</h2>
                                        <p className='text-sm text-muted-foreground'>The limit is between 2 and 4</p>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="4"
                                        max={4}
                                        min={2}
                                        onChange={(e) => setChoices(Number.parseInt(e.target.value))}
                                    />
                                </div>
                                {
                                    choices > 1 &&
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-2xl tracking-tight font-semibold">Type of possible answers:</h2>

                                        <Select defaultValue={choicesType ?? undefined}
                                            onValueChange={(v: "alpha" | "numeric") => setChoicesType(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='alpha'>Alphabets</SelectItem>
                                                <SelectItem value='numeric'>Numbers</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                }
                                {(showChoices && choicesType) && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-2xl tracking-tight font-semibold">Select the right answer for this question:</h2>
                                        <RadioGroup defaultValue={choicesRepresentation[choicesType][0]} onValueChange={setAnswer}>
                                            {
                                                Array.from({ length: choices }).map((_, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={choicesRepresentation[choicesType][index]} />
                                                        <Label htmlFor='answer'>{choicesRepresentation[choicesType][index]}</Label>
                                                    </div>
                                                ))
                                            }
                                        </RadioGroup>
                                    </div>
                                )}
                            </>
                        )
                    }

                    <Accordion type="single" collapsible={true}>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Design</AccordionTrigger>
                            <AccordionContent>

                                <div className="flex flex-col gap-2 ">
                                    <h2 className="text-lg font-semibold">Background Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        enabledPickers={['solid', 'gradient', 'image']}
                                        background={
                                            config.background || 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                        }
                                        setBackground={(value) => updateConfig({ background: value })}

                                    />
                                </div>

                                <div className="flex flex-col gap-2 ">
                                    <h2 className="text-lg font-semibold">Text Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        background={config.textColor || 'white'}
                                        setBackground={(value) => updateConfig({ textColor: value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 ">
                                    <h2 className="text-lg font-semibold">Bar Line Color</h2>
                                    <ColorPicker
                                        className="w-full"
                                        background={config.barColor || 'yellow'}
                                        setBackground={(value) => updateConfig({ barColor: value })}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <Button
                    disabled={!(question.length > 10 && choices > 1 && choicesType && answer)}
                    onClick={() => {
                        const isDisabled = !(question.length > 10 && choices > 1 && choicesType && answer)
                        if (isDisabled) return
                        const questionIndex = config.qna.length
                            ? Math.max(...config.qna.map((o) => o.index)) + 1
                            : 1

                        console.log({ questionIndex, });
                        const qna = [
                            ...(config.qna),
                            {
                                question,
                                answer,
                                choices,
                                isNumeric: choicesType === 'numeric',
                                index: questionIndex
                            }
                        ]
                        // config.qna.push()
                        console.log('adding new qna', { qna })
                        updateConfig({
                            qna
                        })
                        setQuestion('')
                        setAnswer('')
                        setChoices(0)
                        setChoicesType(null)
                        setShowChoices(false)
                    }} className="w-full bg-border hover:bg-secondary-border text-primary">
                    Add Question
                </Button>

                <Separator className="my-4" />
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-2xl font-bold">Questions</h2>
                    {config.qna.map((qna, i) => (
                        <div key={qna.index + "_" + i} className="flex flex-col w-full h-full items-center space-y-2">
                            <div className="flex flex-row gap-2 justify-center items-center h-full">
                                <div className="flex flex-col justify-center items-center font-bold text-black bg-white rounded-full min-w-12 min-h-12">
                                    # {i}
                                </div>
                                <p className="font-muet">
                                    {qna.question.length > 100 ? qna.question.substring(0, 100) + "..." + qna.question.substring(qna.question.length - 20) : qna.question}
                                </p>
                            </div>
                            <div className="flex flex-row gap-2 justify-center align-center">
                                <Button onClick={() => {
                                    setCurrentQna(qna)
                                    setOpen(true)
                                }} >Edit</Button>
                                <Button onClick={() => {
                                    const newQna = config.qna.filter((q) => q.index !== qna.index)
                                    console.log(`Deleting ${qna.index}`, { newQna })
                                    updateConfig({ qna: newQna })
                                }} variant='destructive'>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            {
                currentQna && (

                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerContent>
                            <DrawerHeader className="text-left">
                                <DrawerTitle>Edit Your question</DrawerTitle>
                                <DrawerDescription>
                                    Make changes to your question here. Click update when you're done.
                                </DrawerDescription>
                            </DrawerHeader>
                            <QuestionUpdateForm qna={currentQna} onChangeQna={setCurrentQna} />

                            <DrawerFooter>
                                <Button
                                    onClick={() => {
                                        if (!currentQna) {
                                            return

                                        }
                                        const newTweets = config?.qna?.map((qna) =>
                                            qna.index === currentQna.index ? currentQna : qna
                                        )

                                        updateConfig({ tweets: newTweets })
                                        setOpen(false)
                                    }}
                                >
                                    Update
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                )
            }
        </>
    )
}


function QuestionUpdateForm({ qna, onChangeQna }: {
    qna: Config['qna'][number]
    onChangeQna: (qna: Config['qna'][number]) => void
}) {
    const choices = qna.choices
    const choicesType = qna.isNumeric ? 'numeric' : 'alpha'
    const representation = choicesRepresentation[choicesType]
    console.log(`QuestionUpdateForm >> qna`, qna)
    console.log(`QuestionUpdateForm >> representation`, representation)

    return (
        <div className='flex flex-col gap-5 px-4'>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col space-y-1">
                    <h2 className="text-2xl tracking-tight font-semibold">Question</h2>
                </div>
                <ScrollArea className="px-5 rounded-md border">
                    <Textarea
                        onChange={(e) => {
                            onChangeQna({
                                ...qna,
                                question: e.target.value,
                            })
                        }}
                        value={qna.question}
                        className='w-full max-h-40 border-none'
                    />

                </ScrollArea>
            </div >

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl tracking-tight font-semibold">How many possible answers?</h2>
                <Input
                    type="number"
                    defaultValue={qna.choices}
                    max={4}
                    min={2}
                    onChange={(e) => {
                        onChangeQna({
                            ...qna,
                            choices: Number.parseInt(e.target.value),
                        })

                    }}
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl tracking-tight font-semibold">Type of possible answers:</h2>
                <Select defaultValue={qna.isNumeric ? 'numeric' : 'alpha'}
                    onValueChange={(v: "alpha" | "numeric") => {
                        onChangeQna({
                            ...qna,
                            isNumeric: v === 'numeric'
                        })

                    }}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='alpha'>Alphabets</SelectItem>
                        <SelectItem value='numeric'>Numbers</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl tracking-tight font-semibold">Select the right answer for this question:</h2>
                <RadioGroup
                    defaultValue={qna.answer}
                    onValueChange={(v) => {
                        console.log(`Answer selection v`, v)
                        // onChangeQna({
                        //     ...qna,
                        //     answer: 
                        // })
                    }}
                >
                    {
                        Array.from({ length: choices }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={choicesRepresentation[choicesType][index]} />
                                <Label htmlFor='answer'>{choicesRepresentation[choicesType][index]}</Label>
                            </div>
                        ))
                    }
                </RadioGroup>
            </div>
        </div>
    )
}
