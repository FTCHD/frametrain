import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import type { Config } from '../..'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker, FontFamilyPicker, FontStylePicker } from '@/sdk/components'
import { Textarea } from '@/components/shadcn/Textarea'
import { Label } from '@/components/shadcn/InputLabel'
import { Switch } from '@/components/shadcn/Switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { choicesRepresentation } from '../../utils'
import { Button } from '@/components/shadcn/Button'
import { LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/shadcn'

export default function Qna({
    qna,
    className,
}: { qna?: Config['qna'][number]; className?: string }) {
    const defaultQuestionStyles = {
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
    } as NonNullable<Config['qna'][number]['design']>
    const [config, updateConfig] = useFrameConfig<Config>()
    const [customizeQna, setCustomizeQna] = useState(!!qna?.design)
    const [loading, setLoading] = useState(false)
    const [customization, setCustomization] = useState<typeof defaultQuestionStyles>(
        qna?.design ?? defaultQuestionStyles
    )
    const [countChoices, setCountChoices] = useState(qna?.choices.length || 2)
    const [choicesType, setChoicesType] = useState<'alpha' | 'numeric'>('alpha')
    const uploadImage = useUploadImage()
    //   refs
    const questionInputRef = useRef<HTMLInputElement>(null)
    const answersInputRef = useRef<string | null>(null)
    const questionFontSizeInputRef = useRef<HTMLInputElement>(null)
    const reviewFontSizeInputRef = useRef<HTMLInputElement>(null)
    const answersFontSizeInputRef = useRef<HTMLInputElement>(null)
    const answerRef = useRef<string | null>(null)

    useEffect(() => {
        if (!questionInputRef.current) return
        if (questionInputRef.current.value) return
        if (!qna?.question) return

        questionInputRef.current.value = qna.question
    }, [qna?.question])

    useEffect(() => {
        if (answersInputRef.current) return
        if (!qna?.answers) return

        answersInputRef.current = qna.answers
    }, [qna?.answers])

    useEffect(() => {
        if (answerRef.current) return
        if (!qna?.answer) return

        answerRef.current = qna.answer
    }, [qna?.answer])

    //   for questionFontSizeInputRef
    useEffect(() => {
        if (!questionFontSizeInputRef.current) return
        if (questionFontSizeInputRef.current.value) return
        if (customization.questionSize.length < 3) return

        questionFontSizeInputRef.current.value = customization.questionSize
    }, [customization.questionSize])

    //   for reviewFontSizeInputRef
    useEffect(() => {
        if (!reviewFontSizeInputRef.current) return
        if (reviewFontSizeInputRef.current.value) return
        if (!customization.reviewSize) return
        if (customization.reviewSize.length < 3) return

        reviewFontSizeInputRef.current.value = customization.reviewSize!
    }, [customization.reviewSize])

    //   for answersFontSizeInputRef
    useEffect(() => {
        if (!answersFontSizeInputRef.current) return
        if (answersFontSizeInputRef.current.value) return
        if (customization.answersSize.length < 3) return

        answersFontSizeInputRef.current.value = customization.answersSize
    }, [customization.answersSize])

    return (
        <div className={cn('w-full h-full flex flex-col gap-5', className)}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center justify-between gap-2 px-4">
                            <Label className="font-md" htmlFor="qna-customization">
                                Enable QnA Customization?
                            </Label>
                            <Switch
                                id="qna-customization"
                                // className="h-8 w-14"
                                checked={customizeQna}
                                onCheckedChange={setCustomizeQna}
                            />
                        </div>
                    </div>
                </div>
                {customizeQna && (
                    <>
                        <h2 className="text-2xl font-bold">Styles Customization</h2>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Quiz Slide Background Color</h2>
                            <ColorPicker
                                className="w-full"
                                enabledPickers={['solid', 'gradient', 'image']}
                                background={qna?.design?.backgroundColor || '#09203f'}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        backgroundColor: value,
                                    })
                                }
                                uploadBackground={async (base64String, contentType) => {
                                    const { filePath } = await uploadImage({
                                        base64String: base64String,
                                        contentType: contentType,
                                    })

                                    return filePath
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Question Color</h2>
                            <ColorPicker
                                className="w-full"
                                background={customization?.questionColor}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        questionColor: value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Question Font Size</h2>
                            <Input
                                placeholder="20px"
                                className="text-lg"
                                ref={questionFontSizeInputRef}
                            />
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Answers Color</h2>
                            <ColorPicker
                                className="w-full"
                                background={customization.answersColor || 'white'}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        questionColor: value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Answers Font Size</h2>
                            <Input
                                placeholder="10px"
                                className="text-lg"
                                ref={answersFontSizeInputRef}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Font Family for both Quiz Slide</h2>
                            <FontFamilyPicker
                                defaultValue={customization.qnaFont || 'Roboto'}
                                onSelect={(font) => {
                                    setCustomization({
                                        ...customization,
                                        qnaFont: font,
                                    })
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Font Style for both Quiz Slide</h2>
                            <FontStylePicker
                                currentFont={config.cover.configuration?.fontFamily || 'Roboto'}
                                defaultValue={config.cover.configuration?.fontStyle || 'normal'}
                                onSelect={(style) =>
                                    setCustomization({
                                        ...customization,
                                        qnaStyle: style,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Progress bar Color</h2>
                            <ColorPicker
                                className="w-full"
                                background={customization.barColor || 'yellow'}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        barColor: value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Review Zone Background</h2>
                            <ColorPicker
                                className="w-full"
                                enabledPickers={['solid', 'gradient']}
                                background={qna?.design?.reviewBackgroundColor || '#09203f'}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        reviewBackgroundColor: value,
                                    })
                                }
                                uploadBackground={async (base64String, contentType) => {
                                    const { filePath } = await uploadImage({
                                        base64String: base64String,
                                        contentType: contentType,
                                    })

                                    return filePath
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <h2 className="text-lg font-semibold">Review Zone Color</h2>
                            <ColorPicker
                                className="w-full"
                                background={customization?.reviewColor ?? 'white'}
                                setBackground={(value) =>
                                    setCustomization({
                                        ...customization,
                                        reviewColor: value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg">Review Zone Size</h2>
                            <Input
                                placeholder="20px"
                                className="text-lg"
                                ref={reviewFontSizeInputRef}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg">Question</h2>
                <Input
                    ref={questionInputRef}
                    placeholder="What is the current popular coin on Farcaster?"
                />
            </div>
            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Answers</h2>
                <Textarea
                    defaultValue={qna?.answers}
                    placeholder={`
                A. Higher
                B. Ethereum
                C. Degen
                D. Shiba Inu
            `}
                    onChange={(e) => {
                        e.preventDefault()
                        answersInputRef.current = e.target.value
                    }}
                    className="w-full"
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col space-y-1">
                    <h2 className="text-lg tracking-tight font-semibold">
                        How many possible answers?
                    </h2>
                    <p className="text-sm text-muted-foreground">The limit is between 2 and 4</p>
                </div>
                <Input
                    defaultValue={countChoices}
                    type="number"
                    required={true}
                    placeholder="4"
                    max={4}
                    min={2}
                    onChange={(e) => {
                        e.preventDefault()
                        const count = Number.parseInt(e.target.value)
                        setCountChoices(count < 2 ? 2 : count > 4 ? 4 : count)
                    }}
                />
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl tracking-tight font-semibold">Type of possible answers:</h2>

                <Select
                    defaultValue={choicesType}
                    onValueChange={(v: 'alpha' | 'numeric') => setChoicesType(v)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="alpha">Alphabets</SelectItem>
                        <SelectItem value="numeric">Numbers</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {countChoices >= 2 && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-2xl tracking-tight font-semibold">
                        Select the right answer for this question:
                    </h2>
                    <RadioGroup
                        defaultValue={qna?.answer}
                        onValueChange={(answer) => {
                            answerRef.current = answer
                        }}
                    >
                        {Array.from({
                            length: countChoices,
                        }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={choicesRepresentation[choicesType][index]} />
                                <Label htmlFor="answer">
                                    {choicesRepresentation[choicesType][index]}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )}

            <Button
                disabled={loading}
                onClick={() => {
                    const isDisabled = !(
                        questionInputRef.current?.value &&
                        answersInputRef.current &&
                        answerRef.current &&
                        countChoices > 2
                    )

                    if (isDisabled) return
                    setLoading(true)

                    const question = questionInputRef.current.value
                    const answers = answersInputRef.current!
                    const answer = answerRef.current!
                    const choices = Array.from({ length: countChoices }).map(
                        (_, i) => choicesRepresentation[choicesType][i]
                    )

                    const questionIndex = qna
                        ? qna.index
                        : config.qna.length
                          ? Math.max(...config.qna.map((o) => o.index)) + 1
                          : 0

                    const data: Config['qna'][number] = {
                        question,
                        answers,
                        choices,
                        answer,
                        index: questionIndex,
                        design: customization,
                    }

                    const newQna = qna
                        ? config.qna.map((q) => (q.index === qna.index ? data : q))
                        : [...config.qna, data]

                    updateConfig({
                        qna: newQna,
                    })
                    setCustomization(defaultQuestionStyles)
                    setCustomizeQna(false)
                    setCountChoices(2)
                    setChoicesType('alpha')
                    questionInputRef.current.value = ''
                    answersInputRef.current = ''
                    if (questionFontSizeInputRef.current) {
                        questionFontSizeInputRef.current.value = ''
                    }
                    // reviewFontSizeInputRef
                    if (reviewFontSizeInputRef.current) {
                        reviewFontSizeInputRef.current.value = ''
                    }
                    if (answersFontSizeInputRef.current) {
                        answersFontSizeInputRef.current.value = ''
                    }
                    answerRef.current = null
                    setLoading(false)
                }}
                className="w-full bg-border hover:bg-secondary-border text-primary"
            >
                {loading ? (
                    <LoaderIcon className="mr-4 w-6 h-6 animate-spin" />
                ) : (
                    `${qna ? 'Update QnA' : 'Add QnA'} Question`
                )}
            </Button>
        </div>
    )
}
