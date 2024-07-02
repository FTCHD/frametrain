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
import toast from 'react-hot-toast'
import type { Config, Slide } from '.'

type IImageTypes = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

export const PRESENTATION_DEFAULTS: Config = {
    slides: [
        {
            aspect: '1:1',
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
                text: '',
                color: '#000000',
                font: 'Roboto',
                align: 'left',
                weight: '400',
            },
        },
    ],
}

export default function Inspector() {
    const uploadImage = useUploadImage()

    // General States
    const [config, updateConfig] = useFrameConfig<Config>()

    // Image States
    const [loading, setLoading] = useState(false)

    // Slide states
    // There's a timestampt to keep track of input keys
    // When a slide gets deleted, we need to be sure new form element doesn't have the key of an deleted element
    const [slide, setSlide] = useState<Slide & { ts: number }>({
        ...PRESENTATION_DEFAULTS.slides[0],
        ts: Date.now(),
    })
    const [slideIndex, setSlideIndex] = useState(0)

    /* USE-EFFECTs */
    // Apply default presentation if no slide has left
    useEffect(() => {
        if (!config?.slides?.length) updateConfig(PRESENTATION_DEFAULTS)
    }, [config, updateConfig])

    // Update current slide if slide index changes
    useEffect(() => {
        if (config?.slides?.length) setSlide({ ...config.slides[slideIndex], ts: Date.now() })
    }, [config, slideIndex])

    /* FUNCTIONs */
    function updateSlide(data: any): void {
        const newSlides = [
            ...config.slides.slice(0, slideIndex),
            {
                ...PRESENTATION_DEFAULTS.slides[0],
                ...config.slides[slideIndex],
                ...data,
            },
            ...(config.slides.slice(slideIndex + 1, config.slides.length) || []),
        ]

        updateConfig({ slides: newSlides })
    }

    function swapSlide(direction: 'left' | 'right'): void {
        const og = { ...slide }
        const slides = [...config.slides]

        if (direction === 'left') {
            if (slideIndex === 0) return

            slides[slideIndex] = { ...slides[slideIndex - 1] }
            slides[slideIndex - 1] = og
            setSlideIndex((s) => s - 1)
        } else {
            if (slideIndex === slides.length - 1) return

            slides[slideIndex] = { ...slides[slideIndex + 1] }
            slides[slideIndex + 1] = og
            setSlideIndex((s) => s + 1)
        }

        updateConfig({ slides })
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
        <div className="w-full h-full space-y-4">
            <p>
                This template allows you to split your long content into slides and customize the
                background, font, and title.
            </p>

            {/* Slides */}
            <div className="w-full flex items-center justify-between">
                <h2 className="text-2xl font-bold">Slides</h2>

                {/* Slide Buttons */}
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => swapSlide('left')}
                        disabled={slideIndex === 0}
                        className="text-xl flex items-center justify-center h-10 w-10 border-input border-[1px] rounded-md cursor-pointer bg-[#ffffff10] disabled:cursor-default disabled:text-gray-500"
                    >
                        &lt;
                    </button>
                    <button
                        type="button"
                        onClick={() => swapSlide('right')}
                        disabled={slideIndex === config?.slides?.length - 1}
                        className="text-xl flex items-center justify-center h-10 w-10 border-input border-[1px] rounded-md cursor-pointer bg-[#ffffff10] disabled:cursor-default disabled:text-gray-500"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <div
                    onClick={() => {
                        updateConfig({
                            slides: [...config.slides, PRESENTATION_DEFAULTS.slides[0]],
                        })
                        setSlideIndex((config?.slides || []).length)
                    }}
                    className="w-40 h-40 flex items-center justify-center p-2 border-input border-[1px] rounded-md cursor-pointer"
                >
                    <span className="text-4xl">+</span>
                </div>

                {config.slides?.map((slide: Slide, i: number) => {
                    const isCurrent = i === slideIndex
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
                    if (slide?.image) {
                        background['backgroundImage'] = `url(${slide.image})`
                        background['backgroundRepeat'] = 'no-repeat'
                        background['backgroundSize'] = '100% 100%'
                        background['backgroundPosition'] = 'center'
                    }

                    return (
                        <div
                            key={'s-' + i}
                            onClick={() => setSlideIndex(i)}
                            style={{ ...background }}
                            className={`w-40 h-40 flex items-center justify-center text-xs p-2 border-input border-[1px] rounded-md cursor-pointer ${
                                isCurrent ? 'outline outline-2 outline-blue-300' : 'outline-none'
                            }`}
                        >
                            {slide?.image ? (
                                <img
                                    src={slide.image}
                                    alt="Slide content"
                                    height={10}
                                    width={10}
                                    className="h-full w-full rounded-md"
                                />
                            ) : (
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

                                    {!content && !title && (
                                        <span className="block -rotate-45 font-bold text-[#ffffff50] text-4xl">
                                            EMPTY
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {config.slides?.length > 0 && (
                <Button
                    className="mt-2 w-1/2"
                    variant="destructive"
                    onClick={() => {
                        const slidesArr = config.slides
                        slidesArr.splice(slideIndex, 1)
                        setSlideIndex((c) => Math.max(0, c - 1))
                        updateConfig({ slides: slidesArr })
                    }}
                >
                    Remove Slide
                </Button>
            )}

            <h2 className="text-2xl font-bold">Cover</h2>

            <h3 className="text-lg">Aspect Ratio</h3>
            <Select
                key={'aspect-' + slide.ts}
                defaultValue={slide.aspect || '1:1'}
                onValueChange={(value: '1:1' | '1.91:1') => updateSlide({ aspect: value })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="1:1" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={'1:1'}>1:1</SelectItem>
                    <SelectItem value={'1.91:1'}>1.91:1</SelectItem>
                </SelectContent>
            </Select>

            <h3 className="text-lg">Image</h3>
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
                            if (!props) toast.error('An error occured while uploading the image')

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
                            key={slide.image}
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

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    {/* Title */}
                    <h3 className="text-lg">Title</h3>
                    <Input
                        key={'t-' + slide.ts}
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

                    <h3 className="text-lg">Title Color</h3>
                    <ColorPicker
                        key={'tc-' + slide.ts}
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

                    <h3 className="text-lg">Title Font</h3>
                    <FontFamilyPicker
                        key={'tf-' + slide.ts}
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

                    <h3 className="text-lg">Title Weight</h3>
                    <FontWeightPicker
                        key={'tw-' + slide.ts}
                        currentFont={
                            slide?.title?.font || PRESENTATION_DEFAULTS.slides[0].title!.font
                        }
                        defaultValue={
                            slide?.title?.weight || PRESENTATION_DEFAULTS.slides[0].title!.weight
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

                    <h3 className="text-lg">Title Style</h3>
                    <FontStylePicker
                        key={'ts-' + slide.ts}
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
                    <h3 className="text-lg">Content</h3>

                    <textarea
                        key={'c-' + slide.ts}
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

                    <h3 className="text-lg">Content Color</h3>
                    <ColorPicker
                        key={'cc-' + slide.ts}
                        className="w-full"
                        background={
                            slide?.content?.color || PRESENTATION_DEFAULTS.slides[0].content!.color
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

                    <h3 className="text-lg">Content Font</h3>
                    <FontFamilyPicker
                        key={'cf-' + slide.ts}
                        defaultValue={
                            slide?.content?.font || PRESENTATION_DEFAULTS.slides[0].content!.font
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

                    <h3 className="text-lg">Content Weight</h3>
                    <FontWeightPicker
                        key={'cw-' + slide.ts}
                        currentFont={
                            slide?.content?.font || PRESENTATION_DEFAULTS.slides[0].content!.font
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

                    <h3 className="text-lg">Align Content</h3>
                    <Select
                        key={'ca-' + slide.ts}
                        defaultValue={
                            slide?.content?.align || PRESENTATION_DEFAULTS.slides[0].content!.align
                        }
                        onValueChange={(value: 'left' | 'center' | 'right') =>
                            updateSlide({
                                content: {
                                    ...slide?.content,
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

                    <h3 className="text-lg">Background</h3>
                    <ColorPicker
                        key={'bg-' + slide.ts}
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
                </div>
            </div>
        </div>
    )
}
