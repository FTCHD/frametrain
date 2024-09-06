'use client'
import {
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    Input,
    Label,
    RadioGroup,
    Select,
    Switch,
    Textarea,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useEffect, useState } from 'react'
import type { Config } from '.'
import defaultConfig from '.'
import QnaForm from './components/QnaForm'
import Questions from './components/Questions'
import UploadSlide from './components/UploadSlide'

type QNA = Config['qna'][number]

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [coverStyles, setCoverStyles] = useState(!!config.cover.configuration)
    const [currentQna, setCurrentQna] = useState<Config['qna'][number] | null>(null)
    const [descriptionType, setDescriptionType] = useState<'text' | 'image'>(
        config.success.image ? 'image' : 'text'
    )
    const [successStyles, setSuccessStyles] = useState(!!config.success.configuration)

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

    return (
        <Configuration.Root>
            <Configuration.Section title="Basic">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Allow quiz to be answered only once?</h2>
                    <Select
                        defaultValue={config.answerOnce ? 'yes' : 'no'}
                        onChange={(v) =>
                            updateConfig({
                                answerOnce: v === 'yes',
                            })
                        }
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </Select>
                </div>
                <div className="flex flex-col gap-2 ">
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-medium">Text for Correct answers</h2>
                        <Input
                            className="text-lg"
                            placeholder="Optional"
                            defaultValue={config.results.yesLabel}
                            onChange={(e) => {
                                const value = e.target.value

                                updateConfig({
                                    results: {
                                        ...config.results,
                                        yesLabel: value || undefined,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-medium">Text for Wrong answers</h2>
                        <Input
                            className="text-lg"
                            placeholder="Optional"
                            defaultValue={config.results.noLabel}
                            onChange={(e) => {
                                const value = e.target.value

                                updateConfig({
                                    results: {
                                        ...config.results,
                                        noLabel: value || undefined,
                                    },
                                })
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2 ">
                        <h2 className="text-lg font-semibold">Slide Background</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient']}
                            background={
                                config.results?.background ??
                                defaultConfig.initialConfig.results.background
                            }
                            setBackground={(value) =>
                                updateConfig({
                                    results: {
                                        ...config.results,
                                        background: value,
                                    },
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
                        <h2 className="text-lg font-semibold">Label Background</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient']}
                            background={
                                config.results?.labelBackground ??
                                defaultConfig.initialConfig.results.labelBackground
                            }
                            setBackground={(value) =>
                                updateConfig({
                                    results: {
                                        ...config.results,
                                        labelBackground: value,
                                    },
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
                        <h2 className="text-lg font-semibold">Bar color for correct answers</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient']}
                            background={
                                config.results?.yesBarColor ??
                                defaultConfig.initialConfig.results.yesBarColor
                            }
                            setBackground={(value) =>
                                updateConfig({
                                    results: {
                                        ...config.results,
                                        yesBarColor: value,
                                    },
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
                        <h2 className="text-lg font-semibold">Bar color for wrong answers</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient']}
                            background={
                                config.results?.noBarColor ??
                                defaultConfig.initialConfig.results.noBarColor
                            }
                            setBackground={(value) =>
                                updateConfig({
                                    results: {
                                        ...config.results,
                                        noBarColor: value,
                                    },
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
                </div>
            </Configuration.Section>
            <Configuration.Section title="Cover">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Button Label</h2>
                    <Input
                        placeholder={'Cover Label'}
                        defaultValue={config.cover.label}
                        onChange={(e) =>
                            updateConfig({
                                cover: {
                                    ...config.cover,
                                    label: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Screen Type</h2>
                        <RadioGroup.Root
                            defaultValue={coverType}
                            className="flex flex-row"
                            onValueChange={(val) => {
                                const value = val as 'image' | 'text'
                                setCoverType(value as typeof coverType)
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="text" id="text" />
                                <Label htmlFor="text">Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="image" id="image" />
                                <Label htmlFor="image">Image</Label>
                            </div>
                        </RadioGroup.Root>
                    </div>
                    <div className="flex flex-col gap-4 w-full mb-4">
                        {coverType === 'image' ? (
                            <div className="flex flex-col gap-2 w-full">
                                <label
                                    htmlFor="cover"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {config.cover?.image ? 'Update' : 'Upload'} Image
                                </label>
                                <UploadSlide
                                    htmlFor="cover"
                                    setSlide={(image) => {
                                        updateConfig({
                                            cover: { ...config.cover, image, text: null },
                                        })
                                    }}
                                    uploadSlide={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String,
                                            contentType,
                                        })
                                        return filePath
                                    }}
                                />
                                {config.cover.image ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            updateConfig({
                                                cover: { ...config.cover, image: null },
                                            })
                                        }}
                                        className="w-full"
                                    >
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <h2 className="text-lg font-semibold">Description</h2>
                                        <div className="flex flex-row items-center justify-between gap-2 px-4">
                                            <Label
                                                className="font-md"
                                                htmlFor="cover-text-customization"
                                            >
                                                Customize
                                            </Label>
                                            <Switch
                                                checked={coverStyles}
                                                onCheckedChange={(checked) => {
                                                    setCoverStyles(checked)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        defaultValue={config.cover?.text}
                                        placeholder={'Your Cover description'}
                                        onChange={(e) => {
                                            updateConfig({
                                                cover: {
                                                    ...config.cover,
                                                    text: e.target.value,
                                                    image: null,
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                {/* Font start */}
                                {coverStyles ? (
                                    <>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.cover.configuration?.fontFamily
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontFamily: font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Size</h2>
                                            <Input
                                                defaultValue={config.cover.configuration?.fontSize}
                                                placeholder="10px"
                                                onChange={(e) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontSize: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Cover Text Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.cover.configuration?.textColor || 'white'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                textColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Cover Background Color
                                            </h2>
                                            <ColorPicker
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                className="w-full"
                                                background={
                                                    config.cover.configuration?.backgroundColor ||
                                                    'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                backgroundColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.cover.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover.configuration?.fontFamily
                                                }
                                                onSelect={(weight) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontWeight: weight,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.cover.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover.configuration?.fontStyle ||
                                                    'normal'
                                                }
                                                onSelect={(style) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontStyle: style,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
                                ) : null}

                                {/* Font end */}
                            </>
                        )}
                    </div>
                </div>
            </Configuration.Section>
            <Configuration.Section title="Ending">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">External Link</h2>
                    <Input
                        className="py-2 text-lg "
                        type="url"
                        defaultValue={config.success.url}
                        onChange={(e) => {
                            updateConfig({
                                success: { ...config.success, url: e.target.value },
                            })
                        }}
                        placeholder="https://warpcast.com/~/channel/frametrain"
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Link Label</h2>
                    <Input
                        placeholder={'Ending Label'}
                        defaultValue={config.success.label}
                        onChange={(e) =>
                            updateConfig({
                                success: {
                                    ...config.success,
                                    label: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Screen Type</h2>
                        <RadioGroup.Root
                            defaultValue={descriptionType}
                            className="flex flex-row"
                            onValueChange={(val) => {
                                const value = val as 'image' | 'text'
                                setDescriptionType(value as typeof descriptionType)
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="text" id="text" />
                                <Label htmlFor="text">Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="image" id="image" />
                                <Label htmlFor="image">Image</Label>
                            </div>
                        </RadioGroup.Root>
                    </div>
                    <div className="flex flex-col gap-4 w-full mb-4">
                        {descriptionType === 'image' ? (
                            <div className="flex flex-col gap-2 w-full">
                                <label
                                    htmlFor="image"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {config.success?.image ? 'Update' : 'Upload'} Image
                                </label>
                                <UploadSlide
                                    htmlFor="image"
                                    setSlide={(image) => {
                                        updateConfig({
                                            success: { ...config.success, image, text: null },
                                        })
                                    }}
                                    uploadSlide={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String,
                                            contentType,
                                        })
                                        return filePath
                                    }}
                                />
                                {config.success.image ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            updateConfig({
                                                success: { ...config.success, image: null },
                                            })
                                        }}
                                        className="w-full"
                                    >
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <h2 className="text-lg font-semibold">Description</h2>
                                        <div className="flex flex-row items-center justify-between gap-2 px-4">
                                            <Label
                                                className="font-md"
                                                htmlFor="image-text-customization"
                                            >
                                                Customize
                                            </Label>
                                            <Switch
                                                checked={successStyles}
                                                onCheckedChange={(checked) => {
                                                    setSuccessStyles(checked)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        defaultValue={config.success?.text}
                                        placeholder={'Your Ending description'}
                                        onChange={(e) => {
                                            updateConfig({
                                                success: {
                                                    ...config.success,
                                                    text: e.target.value,
                                                    image: null,
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                {/* Font start */}
                                {successStyles ? (
                                    <>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.success.configuration?.fontFamily
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontFamily: font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Size</h2>
                                            <Input
                                                defaultValue={
                                                    config.success.configuration?.fontSize
                                                }
                                                placeholder="10px"
                                                onChange={(e) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontSize: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Ending Text Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.success.configuration?.textColor ||
                                                    'white'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                textColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Ending Background Color
                                            </h2>
                                            <ColorPicker
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                className="w-full"
                                                background={
                                                    config.success.configuration?.backgroundColor ||
                                                    'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                backgroundColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.success.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.success.configuration?.fontFamily
                                                }
                                                onSelect={(weight) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontWeight: weight,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.success.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.success.configuration?.fontStyle ||
                                                    'normal'
                                                }
                                                onSelect={(style) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontStyle: style,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </Configuration.Section>
            <Configuration.Section title="Question">
                {loaded ? (
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
                ) : null}
            </Configuration.Section>
            <Configuration.Section title="Questions">
                <Questions />
            </Configuration.Section>
        </Configuration.Root>
    )
}
