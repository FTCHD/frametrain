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

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [currentQuestion, setCurrentQuestion] = useState<Config['qna'][number] | null>(null)
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [choicesType, setChoicesType] = useState<"alpha" | "numeric" | null>(null)
    const [choices, setChoices] = useState<number>(0)
    const [showChoices, setShowChoices] = useState<boolean>(false)
    const choicesRepresentation: Record<"alpha" | "numeric", { [key: number]: string }> = {
        alpha: {
            0: 'A',
            1: 'B',
            2: 'C',
            3: 'D',
        },
        numeric: {
            0: '1',
            1: '2',
            2: '3',
            3: '4',
        }
    }


    useEffect(() => {
        console.log('choices', { choices, choicesType })
        if (choices > 1 && choicesType) {
            setShowChoices(true)
        }
    }, [choices, choicesType])

    useEffect(() => {
        console.log('answer', { answer })
    }, [answer])

    useEffect(() => {
        console.log('question', { question })
    }, [question])

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

                        console.log({ questionIndex });
                        const qna = [
                            ...(config.qna || []),
                            {
                                question,
                                answer: Number.parseInt(answer),
                                choices,
                                isNumeric: choicesType === 'numeric',
                                index: questionIndex
                            }
                        ]
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

            </div>
        </>
    )
}
