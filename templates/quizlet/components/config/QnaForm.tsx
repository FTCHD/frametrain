'use client'
import { cn } from '@/lib/shadcn'
import {
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    Input,
    Label,
    RadioGroup,
    Select,
    Switch,
    Textarea,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useState } from 'react'
import type { Config } from '../..'
import { choicesRepresentation } from '../../utils'

type QnaFormProps = {
    qna: Config['qna'][number]
    className?: string
}

type Props = QnaFormProps &
    (
        | {
              mode: 'update'
          }
        | {
              mode: 'create'
              onContinue: (id: number) => void
          }
    )

export default function QnaForm({ qna, className, ...props }: Props) {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [customizeQna, setCustomizeQna] = useState(props.mode === 'update')
    const [countChoices, setCountChoices] = useState(qna.choices.length)
    const [choicesType, setChoicesType] = useState<'alpha' | 'numeric'>(
        qna.choices[0] === '1' ? 'numeric' : 'alpha'
    )
    const uploadImage = useUploadImage()

    return (
        <div className={cn('w-full h-full flex flex-col gap-5', className)}>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center justify-between gap-2 ">
                        <Label className="font-md" htmlFor="qna-customization">
                            Customize styles?
                        </Label>
                        <Switch
                            id="qna-customization"
                            checked={customizeQna}
                            onCheckedChange={setCustomizeQna}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg">Question</h2>
                <Input
                    defaultValue={qna.question}
                    placeholder="What is the current popular coin on Farcaster?"
                    onChange={(e) => {
                        e.preventDefault()
                        updateConfig({
                            qna: config.qna.map((q) =>
                                q.index === qna.index ? { ...q, question: e.target.value } : q
                            ),
                        })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Answers</h2>
                <Textarea
                    defaultValue={qna.answers}
                    placeholder={`
                A. Higher
                B. Ethereum
                C. Degen
                D. Shiba Inu
            `}
                    onChange={(e) => {
                        e.preventDefault()
                        updateConfig({
                            qna: config.qna.map((q) =>
                                q.index === qna.index ? { ...q, answers: e.target.value } : q
                            ),
                        })
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
                        const choices = Array.from({ length: count }).map(
                            (_, i) => choicesRepresentation[choicesType][i]
                        )
                        updateConfig({
                            qna: config.qna.map((q) =>
                                q.index === qna.index ? { ...q, choices } : q
                            ),
                        })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl tracking-tight font-semibold">Type of possible answers:</h2>

                <Select
                    defaultValue={choicesType}
                    onChange={(v) => setChoicesType(v as 'alpha' | 'numeric')}
                >
                    <option value="alpha">Alphabets</option>
                    <option value="numeric">Numbers</option>
                </Select>
            </div>
            {qna.answers.length >= 2 && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-2xl tracking-tight font-semibold">
                        Select the right answer for this question:
                    </h2>
                    <RadioGroup.Root
                        defaultValue={qna.answer}
                        onValueChange={(answer) => {
                            updateConfig({
                                qna: config.qna.map((q) =>
                                    q.index === qna.index ? { ...q, answer } : q
                                ),
                            })
                        }}
                    >
                        {Array.from({
                            length: qna.choices.length,
                        }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroup.Item
                                    value={choicesRepresentation[choicesType][index]}
                                />
                                <Label htmlFor="answer">
                                    {choicesRepresentation[choicesType][index]}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup.Root>
                </div>
            )}

            {customizeQna && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-2xl font-bold">Styles Customization</h2>
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-semibold">Quiz Slide Background Color</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient', 'image']}
                            background={qna?.design?.backgroundColor || '#09203f'}
                            setBackground={(value) => {
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      backgroundColor: value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
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
                            background={qna.design.questionColor}
                            setBackground={(value) => {
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      questionColor: value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Question Font Size</h2>
                        <Input
                            placeholder="20px"
                            className="text-lg"
                            onChange={(e) => {
                                e.preventDefault()
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      questionSize: e.target.value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-semibold">Answers Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={qna.design.answersColor || 'white'}
                            setBackground={(value) =>
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      answersColor: value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Answers Font Size</h2>
                        <Input
                            placeholder="10px"
                            className="text-lg"
                            defaultValue={qna.design.answersSize}
                            onChange={(e) => {
                                e.preventDefault()
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      answersSize: e.target.value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Font Family for both Quiz Slide</h2>
                        <FontFamilyPicker
                            defaultValue={qna.design.qnaFont || 'Roboto'}
                            onSelect={(font) => {
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      qnaFont: font,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Font Style for both Quiz Slide</h2>
                        <FontStylePicker
                            currentFont={qna.design.qnaFont}
                            defaultValue={qna.design.qnaStyle}
                            onSelect={(style) => {
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      qnaStyle: style,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-semibold">Progress bar Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={qna.design.barColor || 'yellow'}
                            setBackground={(value) => {
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      barColor: value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-semibold">Review Zone Background</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient']}
                            background={qna.design.reviewBackgroundColor || '#09203f'}
                            setBackground={(value) =>
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      reviewBackgroundColor: value,
                                                  },
                                              }
                                            : q
                                    ),
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
                            background={qna.design.reviewColor || 'white'}
                            setBackground={(value) =>
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      reviewColor: value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Review Zone Size</h2>
                        <Input
                            placeholder="20px"
                            className="text-lg"
                            defaultValue={qna.design.reviewSize}
                            onChange={(e) => {
                                e.preventDefault()
                                updateConfig({
                                    qna: config.qna.map((q) =>
                                        q.index === qna.index
                                            ? {
                                                  ...q,
                                                  design: {
                                                      ...q.design,
                                                      reviewSize: e.target.value,
                                                  },
                                              }
                                            : q
                                    ),
                                })
                            }}
                        />
                    </div>
                </div>
            )}
            {props.mode === 'create' && (
                <Button
                    onClick={() => {
                        setCustomizeQna(false)
                        setCountChoices(2)
                        setChoicesType('alpha')
                        props.onContinue(qna.index)
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Add another Question & Answer
                </Button>
            )}
        </div>
    )
}
