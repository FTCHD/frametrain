'use client'
import {
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    Input,
    Select,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { LoaderIcon, Trash2Icon } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { type Config, type CustomButtonType, PRESENTATION_DEFAULTS, type Slide } from '.'

type IImageTypes = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

export default function Inspector() {
    const uploadImage = useUploadImage()

    // General States
    const [config, updateConfig] = useFrameConfig<Config>()

    // Image States
    const [loading, setLoading] = useState(false)

    // Slide states
    const [currentSlideIndex, setSlideIndex] = useState(0)

    const slide = useMemo(() => {
        return config.slides[currentSlideIndex] //|| PRESENTATION_DEFAULTS.slides[0]
    }, [config, currentSlideIndex])

    /* USE-EFFECTs */
    // Apply default presentation if no slide has left
    useEffect(() => {
        if (!config?.slides?.length) updateConfig(PRESENTATION_DEFAULTS)
    }, [config, updateConfig])

    /* FUNCTIONs */
    function updateSlide(data: any): void {
        const newSlides = config.slides.with(currentSlideIndex, {
            ...PRESENTATION_DEFAULTS.slides[0],
            ...config.slides[currentSlideIndex],
            ...data,
        })

        updateConfig({ slides: newSlides })
    }

    function swapSlide(direction: 'left' | 'right'): void {
        const og = { ...slide }
        const slides = [...config.slides]

        if (direction === 'left') {
            if (currentSlideIndex === 0) return

            slides[currentSlideIndex] = { ...slides[currentSlideIndex - 1] }
            slides[currentSlideIndex - 1] = og
            setSlideIndex((s) => s - 1)
        } else {
            if (currentSlideIndex === slides.length - 1) return

            slides[currentSlideIndex] = { ...slides[currentSlideIndex + 1] }
            slides[currentSlideIndex + 1] = og
            setSlideIndex((s) => s + 1)
        }

        updateConfig({ slides })
    }

    function updateButtonTarget(newTarget: string, index: number): void {
        const newButtons = slide.buttons.map((b, buttonIndex) =>
            buttonIndex === index ? { ...b, target: newTarget } : b
        )
        updateSlide({ buttons: newButtons })
    }

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
        <Configuration.Root>
            <Configuration.Section title="Slides">
                {/* Slide Buttons */}
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button onClick={() => swapSlide('left')} disabled={currentSlideIndex === 0}>
                        &lt; Move left
                    </Button>
                    <Button
                        onClick={() => swapSlide('right')}
                        disabled={currentSlideIndex === config?.slides?.length - 1}
                    >
                        Move right &gt;
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={config?.slides?.length < 2}
                        onClick={() => {
                            const newSlides = config.slides
                            newSlides.splice(currentSlideIndex, 1)
                            setSlideIndex((c) => Math.max(0, c - 1))
                            updateConfig({ slides: newSlides })
                        }}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div
                        onClick={() => {
                            updateConfig({
                                slides: config.slides.concat([
                                    {
                                        ...PRESENTATION_DEFAULTS.slides[0],
                                        buttons: [
                                            {
                                                type: 'navigate',
                                                label: 'Back',
                                                target: (config.slides.length - 1).toString(),
                                            },
                                        ],
                                    },
                                ]),
                            })
                        }}
                        className="w-40 h-40 flex items-center justify-center p-2 border-input border-[1px] rounded-md cursor-pointer"
                    >
                        <span className="text-4xl">+</span>
                    </div>

                    {config.slides?.map((slide: Slide, i: number) => {
                        const isCurrent = i === currentSlideIndex
                        const content = slide?.content?.text
                        const title = slide?.title?.text

                        const background: any = {}

                        switch (slide.background?.type) {
                            case 'color': {
                                background['background'] = slide.background.value // Covers gradients and solid colors at the same time
                                break
                            }
                            case 'image':
                                background['backgroundImage'] = slide.background.value
                        }

                        /* Images */
                        if (slide?.image && slide.type === 'image') {
                            background['backgroundImage'] = `url(${slide.image})`
                            background['backgroundRepeat'] = 'no-repeat'
                            //! check this
                            background['backgroundSize'] = '100% 100%'
                            background['backgroundPosition'] = 'center'
                        }

                        return (
                            <div
                                key={'s-' + i}
                                onClick={() => setSlideIndex(i)}
                                style={{ ...background }}
                                className={`w-40 h-40 flex items-center justify-center text-xs p-2 border-input border-[1px] rounded-md cursor-pointer ${
                                    isCurrent
                                        ? 'outline outline-2 outline-blue-300'
                                        : 'outline-none'
                                }`}
                            >
                                {slide?.type === 'image' && slide.image && (
                                    <img
                                        src={slide.image}
                                        alt="Slide content"
                                        height={10}
                                        width={10}
                                        className="h-full w-full rounded-md"
                                    />
                                )}
                                {slide.type === 'text' && (content || title) && (
                                    <div className="flex flex-col gap-2">
                                        {title && (
                                            <h2
                                                className="text-lg text-center"
                                                style={{
                                                    // fontFamily: slide.title?.font,
                                                    color: slide.title?.color,
                                                    fontWeight: slide.title?.weight,
                                                }}
                                            >
                                                {title}
                                            </h2>
                                        )}

                                        {content && (
                                            <span
                                                className="text-xs"
                                                style={{
                                                    // fontFamily: slide.content?.font,
                                                    color: slide.content?.color,
                                                    textAlign: slide.content?.align,
                                                    fontWeight: slide.content?.weight,
                                                }}
                                            >
                                                {content.slice(0, 120) +
                                                    (content.length > 120 ? '...' : '')}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!slide.image && !content && !title && (
                                    <span className="block -rotate-45 font-bold text-[#ffffff50] text-4xl">
                                        EMPTY
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Configuration.Section>
            <Configuration.Section title="Current Slide">
                <h2 className="text-lg font-semibold">Type</h2>
                <Select
                    defaultValue={slide.type || 'text'}
                    onChange={(type) => updateSlide({ type: type as 'text' | 'image' })}
                >
                    <option value={'text'}>Text</option>
                    <option value={'image'}>Image</option>
                </Select>
                <h2 className="text-lg font-semibold">Aspect Ratio</h2>
                <Select
                    defaultValue={slide.aspectRatio || '1:1'}
                    onChange={(value) =>
                        updateSlide({ aspectRatio: value as typeof slide.aspectRatio })
                    }
                >
                    <option value={'1:1'}>1:1</option>
                    <option value={'1.91:1'}>1.91:1</option>
                </Select>
                {slide?.type === 'text' && (
                    <>
                        <h2 className="text-lg font-semibold">Background</h2>
                        <ColorPicker
                            enabledPickers={['solid', 'gradient', 'image']}
                            className="w-full"
                            background={
                                slide?.background?.value ||
                                PRESENTATION_DEFAULTS.slides[0].background.value
                            }
                            setBackground={(value: string) =>
                                updateSlide({
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
                                updateSlide({
                                    background: {
                                        type: 'image',
                                        value: filePath,
                                    },
                                })
                                return filePath
                            }}
                        />
                    </>
                )}
                {slide?.type === 'image' && (
                    <>
                        <h2 className="text-lg font-semibold">Object Fit</h2>
                        <Select
                            defaultValue={slide.objectFit || 'fill'}
                            onChange={(value) =>
                                updateSlide({ objectFit: value as typeof slide.objectFit })
                            }
                        >
                            <option value={'fill'}>Fill</option>
                            <option value={'contain'}>Contain</option>
                            <option value={'cover'}>Cover</option>
                            <option value={'none'}>None</option>
                            <option value={'scale-down'}>Scale Down</option>
                        </Select>
                    </>
                )}
                {/* Buttons */}
                <h2 className="text-lg font-semibold">Buttons</h2>
                <div className="flex flex-col gap-3">
                    {slide?.buttons?.map((button, i) => {
                        return (
                            <div key={currentSlideIndex} className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-2">
                                    <Select
                                        defaultValue={button.type || 'navigate'}
                                        onChange={(type) => {
                                            const newButtons = slide.buttons.map((b, j) => {
                                                if (i === j) {
                                                    return {
                                                        ...b,
                                                        type: type as CustomButtonType,
                                                        target: '',
                                                    }
                                                }
                                                return b
                                            })
                                            updateSlide({ buttons: newButtons })
                                        }}
                                    >
                                        <option value={'navigate'}>Navigate</option>
                                        <option value={'link'}>Link</option>
                                        <option value={'mint'}>Mint</option>
                                    </Select>

                                    <Input
                                        className="text-lg flex-1 h-10"
                                        placeholder="Button Text"
                                        defaultValue={button?.label}
                                        onBlur={(e) => {
                                            const newButtons = slide.buttons.map((b, index) => {
                                                if (index === i) {
                                                    return {
                                                        ...b,
                                                        label: e.target.value,
                                                    }
                                                }
                                                return b
                                            })
                                            updateSlide({ buttons: newButtons })
                                        }}
                                    />

                                    {button.type === 'navigate' && (
                                        <Select
                                            defaultValue={button?.target || ''}
                                            onChange={(v) => updateButtonTarget(v, i)}
                                        >
                                            {config.slides.map((_, slideIndex) => (
                                                <option
                                                    disabled={slideIndex === currentSlideIndex}
                                                    key={slideIndex}
                                                    value={slideIndex.toString()}
                                                >
                                                    Slide #{slideIndex + 1}
                                                </option>
                                            ))}
                                        </Select>
                                    )}

                                    {['link', 'mint'].includes(button.type) && (
                                        <Input
                                            className="text-lg flex-1 h-10"
                                            placeholder={
                                                button.type === 'link' ? 'Link' : 'Zora NFT ID'
                                            }
                                            defaultValue={button?.target || ''}
                                            onBlur={(e) => updateButtonTarget(e.target.value, i)}
                                        />
                                    )}

                                    {slide.buttons.length > 1 && (
                                        <Button
                                            className="flex items-center h-10 w-10 text-2xl text-white"
                                            variant="destructive"
                                            onClick={() => {
                                                const newButtons = slide.buttons.filter(
                                                    (_, index) => index !== i
                                                )
                                                updateSlide({ buttons: newButtons })
                                            }}
                                        >
                                            -
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {(slide?.buttons?.length || 0 < 4) && (
                        <Button
                            className="flex items-center w-full p-3 bg-[#ffffff10] text-3xl text-gray-300 hover:bg-[#ffffff15]"
                            onClick={() => {
                                updateSlide({
                                    buttons: [
                                        ...(slide?.buttons || []),
                                        {
                                            type: 'navigate',
                                            label: 'Go',
                                            target: config.slides.length.toString(),
                                        },
                                    ],
                                })
                            }}
                        >
                            +
                        </Button>
                    )}
                </div>
            </Configuration.Section>
            <Configuration.Section title="Title & Content">
                {slide?.type === 'image' ? (
                    <div key={currentSlideIndex} className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Image</h2>
                        <div className="flex flex-col gap-5">
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

                                        updateSlide({ image: filePath })
                                    }}
                                />
                            </label>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-lg font-semibold">Uploaded Images</h3>
                                {loading && <LoaderIcon className="animate-spin" />}
                            </div>
                            <div className="flex flex-row flex-wrap gap-4 mt-2">
                                {slide?.image ? (
                                    <img
                                        src={slide.image}
                                        width={200}
                                        height={200}
                                        alt="Slider item"
                                        className="rounded-md"
                                    />
                                ) : (
                                    <p>There are no images yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key={currentSlideIndex} className="flex flex-col gap-4">
                        {/* Title */}
                        <h2 className="text-lg font-semibold">Title</h2>
                        <Input
                            className="text-lg"
                            placeholder="Title"
                            defaultValue={slide?.title?.text}
                            onBlur={(e) => {
                                updateSlide({
                                    title: {
                                        ...slide?.title,
                                        text: e.target.value,
                                    },
                                })
                            }}
                        />

                        <h2 className="text-lg font-semibold">Title Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={
                                slide?.title?.color || PRESENTATION_DEFAULTS.slides[0].title!.color
                            }
                            setBackground={(value: string) =>
                                updateSlide({
                                    title: {
                                        ...slide?.title,
                                        color: value,
                                    },
                                })
                            }
                        />

                        <h2 className="text-lg font-semibold">Title Font</h2>
                        <FontFamilyPicker
                            defaultValue={
                                slide?.title?.font || PRESENTATION_DEFAULTS.slides[0].title!.font
                            }
                            onSelect={(font) => {
                                updateSlide({
                                    title: {
                                        ...slide?.title,
                                        font,
                                    },
                                })
                            }}
                        />

                        <h2 className="text-lg font-semibold">Title Weight</h2>
                        <FontWeightPicker
                            currentFont={
                                slide?.title?.font || PRESENTATION_DEFAULTS.slides[0].title!.font
                            }
                            defaultValue={
                                slide?.title?.weight ||
                                PRESENTATION_DEFAULTS.slides[0].title!.weight
                            }
                            onSelect={(weight: string) => {
                                updateSlide({
                                    title: {
                                        ...slide?.title,
                                        weight,
                                    },
                                })
                            }}
                        />

                        <h2 className="text-lg font-semibold">Title Style</h2>
                        <FontStylePicker
                            currentFont={
                                slide?.title?.font || PRESENTATION_DEFAULTS.slides[0].title!.font
                            }
                            defaultValue={
                                slide?.title?.style || PRESENTATION_DEFAULTS.slides[0].title!.style
                            }
                            onSelect={(style: string) =>
                                updateSlide({
                                    title: {
                                        ...slide?.title,
                                        style,
                                    },
                                })
                            }
                        />

                        {/* Content */}
                        <h2 className="text-lg font-semibold">Content</h2>

                        <textarea
                            defaultValue={slide?.content?.text || ''}
                            placeholder="Your content"
                            onBlur={(e) => {
                                updateSlide({
                                    content: {
                                        ...slide?.content,
                                        text: e.target.value,
                                    },
                                })
                            }}
                            className="text-lg p-2 border-input border-[1px] rounded-md bg-transparent resize-y min-h-[184px]"
                        />

                        <h2 className="text-lg font-semibold">Content Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={
                                slide?.content?.color ||
                                PRESENTATION_DEFAULTS.slides[0].content!.color
                            }
                            setBackground={(value: string) =>
                                updateSlide({
                                    content: {
                                        ...slide?.content,
                                        color: value,
                                    },
                                })
                            }
                        />

                        <h2 className="text-lg font-semibold">Content Font</h2>
                        <FontFamilyPicker
                            defaultValue={
                                slide?.content?.font ||
                                PRESENTATION_DEFAULTS.slides[0].content!.font
                            }
                            onSelect={(font) => {
                                updateSlide({
                                    content: {
                                        ...slide?.content,
                                        font,
                                    },
                                })
                            }}
                        />

                        <h2 className="text-lg font-semibold">Content Weight</h2>
                        <FontWeightPicker
                            currentFont={
                                slide?.content?.font ||
                                PRESENTATION_DEFAULTS.slides[0].content!.font
                            }
                            defaultValue={
                                slide?.content?.weight ||
                                PRESENTATION_DEFAULTS.slides[0].content!.weight
                            }
                            onSelect={(weight: string) => {
                                updateSlide({
                                    content: {
                                        ...slide?.content,
                                        weight,
                                    },
                                })
                            }}
                        />

                        <h2 className="text-lg font-semibold">Content Align</h2>
                        <Select
                            defaultValue={
                                slide?.content?.align ||
                                PRESENTATION_DEFAULTS.slides[0].content!.align
                            }
                            onChange={(value) =>
                                updateSlide({
                                    content: {
                                        ...slide?.content,
                                        align: value as 'left' | 'center' | 'right',
                                    },
                                })
                            }
                        >
                            <option value={'left'}>Left</option>
                            <option value={'center'}>Center</option>
                            <option value={'right'}>Right</option>
                        </Select>
                    </div>
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}
