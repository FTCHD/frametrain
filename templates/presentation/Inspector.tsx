'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { LoaderIcon } from 'lucide-react'
import { type ChangeEvent, useEffect, useState } from 'react'
import type { Config, PresentationType } from '.'
import toast from 'react-hot-toast'

type IImageTypes = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

export const PRESENTATION_DEFAULTS: Config<'text'> = {
    type: 'text',
    background: {
        type: 'color',
        value: 'linear-gradient(245deg, rgb(252,136,0), rgb(252,0,162))',
    },
    title: {
        text: '',
        color: '#1c1c1c',
        weight: '700',
        font: 'Inter',
        style: 'normal',
    },
    content: {
        text: [],
        color: '#000000',
        font: 'Roboto',
        align: 'left',
        weight: '400',
    },
}

export default function Inspector() {
    const uploadImage = useUploadImage()

    // General States
    const [config, updateConfig] = useFrameConfig<Config>()

    // Image States
    const [loading, setLoading] = useState(false)

    // Slide states
    const [currentSlide, setCurrentSlide] = useState(0)

    /* USE-EFFECTs */
    // Update config type
    useEffect(() => {
        if (!config?.type) {
            if (config?.images?.length) updateConfig({ type: 'images' })
            else updateConfig({ type: 'text' })
        }

        // Set default background properties
        if (!config?.background) {
            updateConfig({
                background: {
                    type: config?.background?.value.includes('url') ? 'image' : 'color',
                    value: config?.background?.value || PRESENTATION_DEFAULTS.background.value,
                },
            })
        }
    }, [config, updateConfig])

    /* FUNCTIONs */
    async function getUploadImageProps(
        e: ChangeEvent<HTMLInputElement>
    ): Promise<{ base64String: string; contentType: IImageTypes } | null> {
        if (!e.target.files?.[0]) return null
        setLoading(true)

        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])

        const base64String = (await new Promise((resolve) => {
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1]
                resolve(base64String)
            }
        })) as string

        const contentType = e.target.files[0].type as IImageTypes
        setLoading(false)

        return {
            base64String,
            contentType,
        }
    }

    return (
        <div className="w-full h-full space-y-4">
            <p>
                This template allows you to split your long content into slides and customize the
                background, font, and title.
            </p>

            {/* Slider Type */}
            <h2 className="text-2xl font-bold">Type</h2>
            <h3 className="text-lg">Select a Slider Type</h3>
            <Select
                defaultValue={config?.type || 'text'}
                onValueChange={(type: PresentationType) => updateConfig({ type })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Text / Image" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={'text'}>Text</SelectItem>
                    <SelectItem value={'image'}>Image</SelectItem>
                </SelectContent>
            </Select>

            {/* Conditioned Form */}
            {config.type === 'image' ? (
                <>
                    <h3 className="text-lg">Aspect Ratio</h3>
                    <Select
                        defaultValue={config?.aspect || '1:1'}
                        onValueChange={(value: '1:1' | '1.91:1') =>
                            updateConfig({
                                aspect: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="1:1" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={'1:1'}>1:1</SelectItem>
                            <SelectItem value={'1.91:1'}>1.91:1</SelectItem>
                        </SelectContent>
                    </Select>

                    <h2 className="text-2xl font-bold">Images</h2>
                    <div className="flex flex-col gap-5">
                        {!config?.images?.length ? (
                            <label
                                htmlFor="uploadFile"
                                className="flex cursor-pointer items-center justify-center rounded-md py-1.5 px-2 text-md font-medium bg-border text-primary hover:bg-secondary-border"
                            >
                                Upload a file
                                <Input
                                    type="file"
                                    id="uploadFile"
                                    className="sr-only"
                                    accept="application/jpeg"
                                    onChange={async (e) => {
                                        const props = await getUploadImageProps(e)
                                        if (!props)
                                            toast.error(
                                                'An error occured while uploading the image'
                                            )

                                        let { filePath } = await uploadImage({
                                            base64String: props?.base64String as string,
                                            contentType: props?.contentType as IImageTypes,
                                        })

                                        filePath = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`

                                        updateConfig({
                                            images: [...(config?.images ?? []), filePath],
                                        })
                                    }}
                                />
                            </label>
                        ) : (
                            <div className="flex flex-row space-x-4 w-full">
                                <label
                                    htmlFor="uploadFile"
                                    className="flex w-full cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border text-primary hover:bg-secondary-border"
                                >
                                    Upload Another file
                                    <Input
                                        type="file"
                                        id="uploadFile"
                                        className="sr-only"
                                        accept="application/jpeg"
                                        onChange={async (e) => {
                                            const props = await getUploadImageProps(e)
                                            if (!props)
                                                toast.error(
                                                    'An error occured while uploading the image'
                                                )

                                            let { filePath } = await uploadImage({
                                                base64String: props?.base64String as string,
                                                contentType: props?.contentType as IImageTypes,
                                            })

                                            filePath = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`

                                            updateConfig({
                                                images: [...(config?.images ?? []), filePath],
                                            })
                                        }}
                                    />
                                </label>
                                <Button
                                    variant="destructive"
                                    onClick={() => updateConfig({ images: [] })}
                                    className="w-full"
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-lg font-semibold">Uploaded Images</h2>
                            {loading && <LoaderIcon className="animate-spin" />}
                        </div>
                        <div className="flex flex-row flex-wrap gap-4 mt-2">
                            {!config?.images?.length && <p>There are no images yet</p>}
                            {config?.images?.map((slideUrl: string) => (
                                <img
                                    key={slideUrl}
                                    src={slideUrl}
                                    width={200}
                                    height={200}
                                    alt="Slider item"
                                    className="rounded-md"
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold">Content</h2>

                        {/* Title */}
                        <h3 className="text-lg">Title</h3>
                        <Input
                            className="text-lg"
                            placeholder="Title"
                            defaultValue={config?.title?.text}
                            onChange={(e) => {
                                updateConfig({
                                    title: {
                                        ...PRESENTATION_DEFAULTS.title, // Being sure all properties are defined within title
                                        ...config.title,
                                        text: e.target.value,
                                    },
                                })
                            }}
                        />

                        <h3 className="text-lg">Title Color</h3>
                        <ColorPicker
                            className="w-full"
                            background={config?.title?.color || PRESENTATION_DEFAULTS.title?.color}
                            setBackground={(value: string) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        color: value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-lg">Title Weight</h3>
                        <FontWeightPicker
                            currentFont={config?.title?.font || PRESENTATION_DEFAULTS.title?.font}
                            defaultValue={
                                config?.title?.weight || PRESENTATION_DEFAULTS.title?.weight
                            }
                            onSelect={(weight: string) => {
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        weight: weight,
                                    },
                                })
                            }}
                        />

                        <h3 className="text-lg">Title Style</h3>
                        <FontStylePicker
                            currentFont={config?.title?.font || PRESENTATION_DEFAULTS.title?.font}
                            defaultValue={
                                config?.title?.style || PRESENTATION_DEFAULTS.title?.style
                            }
                            onSelect={(style: string) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        style,
                                    },
                                })
                            }
                        />

                        {/* Slides */}
                        <h3 className="text-lg">Slides</h3>
                        <div className="flex flex-wrap gap-3">
                            <div
                                onClick={() => {
                                    setCurrentSlide((config?.content?.text || []).length)
                                    updateConfig({
                                        content: {
                                            ...PRESENTATION_DEFAULTS.content,
                                            ...config.content,
                                            text: [...(config?.content?.text || []), ''],
                                        },
                                    })
                                }}
                                className="w-40 h-40 flex items-center justify-center p-2 border-input border-[1px] rounded-md cursor-pointer"
                            >
                                <span className="text-4xl">+</span>
                            </div>
                            {(config?.content?.text || [])?.map((t: string, i: number) => {
                                const isCurrent = i === currentSlide

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`w-40 h-40 flex items-center justify-center text-xs p-2 border-input border-[1px] rounded-md cursor-pointer ${
                                            isCurrent ? 'bg-[#ffffff10]' : 'bg-transparent'
                                        }`}
                                    >
                                        {t ? t.slice(0, 120) + (t.length > 120 ? '...' : '') : ''}
                                    </div>
                                )
                            })}
                        </div>

                        {config?.content?.text?.length > 0 && (
                            <Button
                                className="mt-2 w-1/2"
                                variant="destructive"
                                onClick={() => {
                                    const contentArr = config?.content?.text || []
                                    contentArr.splice(currentSlide, 1)
                                    setCurrentSlide((c) => Math.max(0, c - 1))
                                    updateConfig({
                                        content: {
                                            ...PRESENTATION_DEFAULTS.content,
                                            ...config.content,
                                            text: contentArr,
                                        },
                                    })
                                }}
                            >
                                Remove Slide
                            </Button>
                        )}

                        {/* Content */}
                        <h3 className="text-lg">Content</h3>

                        <textarea
                            key={currentSlide}
                            defaultValue={config?.content?.text?.[currentSlide] || ''}
                            placeholder="Your content"
                            onChange={(e) => {
                                const contentArr = config?.content?.text || []
                                contentArr[currentSlide] = e.target.value
                                updateConfig({
                                    content: {
                                        ...PRESENTATION_DEFAULTS.content,
                                        ...config.content,
                                        text: contentArr,
                                    },
                                })
                            }}
                            className="text-lg p-2 border-input border-[1px] rounded-md bg-transparent resize-y min-h-[184px]"
                        />

                        <h3 className="text-lg">Content Color</h3>
                        <ColorPicker
                            className="w-full"
                            background={
                                config?.content?.color || PRESENTATION_DEFAULTS.content?.color
                            }
                            setBackground={(value: string) =>
                                updateConfig({
                                    content: {
                                        ...config.content,
                                        color: value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-lg">Content Font</h3>
                        <FontFamilyPicker
                            defaultValue={
                                config?.content?.font || PRESENTATION_DEFAULTS.content?.font
                            }
                            onSelect={(font) => {
                                updateConfig({
                                    content: {
                                        ...config.content,
                                        font,
                                    },
                                })
                            }}
                        />

                        <h3 className="text-lg">Content Weight</h3>
                        <FontWeightPicker
                            currentFont={
                                config?.content?.font || PRESENTATION_DEFAULTS.content?.font
                            }
                            defaultValue={
                                config?.content?.weight || PRESENTATION_DEFAULTS.content?.weight
                            }
                            onSelect={(weight: string) => {
                                updateConfig({
                                    content: {
                                        ...config.content,
                                        weight: weight,
                                    },
                                })
                            }}
                        />

                        <h3 className="text-lg">Align Content</h3>
                        <Select
                            defaultValue={
                                config?.content?.align || PRESENTATION_DEFAULTS.content?.align
                            }
                            onValueChange={(value: 'left' | 'center' | 'right') =>
                                updateConfig({
                                    content: {
                                        ...config.content,
                                        align: value,
                                    },
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Left" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'left'}>Left</SelectItem>
                                <SelectItem value={'center'}>Center</SelectItem>
                                <SelectItem value={'right'}>Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <h2 className="text-2xl font-bold">Background</h2>
                    <ColorPicker
                        enabledPickers={['solid', 'gradient', 'image']}
                        className="w-full"
                        background={
                            config?.background?.value || PRESENTATION_DEFAULTS.background.value
                        }
                        setBackground={(value: string) =>
                            updateConfig({
                                background: {
                                    type: value.includes('url') ? 'image' : 'color',
                                    value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })
                            updateConfig({
                                background: {
                                    type: 'image',
                                    value: filePath,
                                },
                            })
                            return filePath
                        }}
                    />
                </div>
            )}
        </div>
    )
}
