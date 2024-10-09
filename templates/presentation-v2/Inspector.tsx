'use client'
import { BasicViewInspector, Button, Input, Select } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { Trash } from 'lucide-react'
import type { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces'
import { useState } from 'react'
import type { Config, Slide, SlideButton } from '.'
import getPDFDocument, { createPDFPage, renderPDFToCanvas } from './utils'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const frameId = useFrameId()

    const [uploading, setUploading] = useState(false)

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
                {/* <code>{JSON.stringify(config, null, 2)}</code> */}

                {config.coverType && config.coverType !== 'disabled' && (
                    <Select
                        defaultValue={config.coverType}
                        onChange={(newValue) => {
                            updateConfig({ coverType: newValue })
                        }}
                        placeholder="Select a cover type"
                    >
                        <option key="disabled" value="disabled">
                            Disabled
                        </option>
                        <option key="image" value="image">
                            Image
                        </option>
                        <option key="text" value="text">
                            Text
                        </option>
                    </Select>
                )}

                {(!config.coverType || config.coverType === 'disabled') && (
                    <Select
                        onChange={(newValue) => {
                            updateConfig({ coverType: newValue })
                        }}
                        placeholder="Select a type to enable the cover"
                    >
                        <option key="image" value="image">
                            Image
                        </option>
                        <option key="text" value="text">
                            Text
                        </option>
                    </Select>
                )}

                {config.coverType === 'text' && (
                    <BasicViewInspector
                        name="Cover"
                        title={config?.coverStyling?.title || { text: '' }}
                        subtitle={config?.coverStyling?.subtitle || { text: '' }}
                        bottomMessage={config?.coverStyling?.bottomMessage || { text: '' }}
                        background={config?.coverStyling?.background}
                        onUpdate={(coverStyling) => {
                            updateConfig({
                                coverStyling,
                            })
                        }}
                    />
                )}
            </Configuration.Section>

            <Configuration.Section title="Actions">
                <div className="flex flex-row gap-1">
                    <label
                        htmlFor="uploadImage"
                        className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                    >
                        Upload Image
                        <Input
                            id="uploadImage"
                            accept="image/*"
                            type="file"
                            disabled={uploading}
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files?.[0]
                                    if (uploading) return

                                    setUploading(true)

                                    const reader = new FileReader()
                                    reader.readAsDataURL(e.target.files[0])

                                    const base64String = (await new Promise((resolve) => {
                                        reader.onload = () => {
                                            const base64String = (reader.result as string).split(
                                                ','
                                            )[1]
                                            resolve(base64String)
                                        }
                                    })) as string

                                    const contentType = e.target.files[0].type as
                                        | 'image/png'
                                        | 'image/jpeg'
                                        | 'image/gif'
                                        | 'image/webp'

                                    const { fileName } = await uploadImage({
                                        base64String: base64String,
                                        contentType: contentType,
                                    })

                                    const lastSlideIndex = config.slides?.length || 0

                                    const slideButtons: SlideButton[] = []

                                    if (lastSlideIndex > 0) {
                                        slideButtons.push({
                                            text: 'Back',
                                            type: 'slide',
                                            target: (lastSlideIndex - 1).toString(),
                                        })
                                    }

                                    const newSlide: Slide = {
                                        imageUrl:
                                            process.env.NEXT_PUBLIC_CDN_HOST +
                                            '/frames/' +
                                            frameId +
                                            '/' +
                                            fileName,
                                        buttons: slideButtons,
                                        aspectRatio: '1:1',
                                    }

                                    updateConfig({
                                        slides: [...(config.slides || []), newSlide],
                                    })

                                    setUploading(false)
                                }
                            }}
                            className="sr-only "
                        />
                    </label>
                    <Button
                        className="flex-1"
                        variant={'primary'}
                        onClick={async () => {
                            const imageUrl = prompt('Enter the image URL')

                            if (imageUrl) {
                                const slideButtons: SlideButton[] = []

                                const slidesCount = config.slides?.length

                                if (slidesCount > 0) {
                                    slideButtons.push({
                                        text: 'Back',
                                        type: 'slide',
                                        target: (slidesCount - 1).toString(),
                                    })
                                }

                                updateConfig({
                                    slides: [
                                        ...(config.slides || []),
                                        {
                                            imageUrl: imageUrl,
                                            aspectRatio: '1:1',
                                            buttons: slideButtons,
                                        },
                                    ],
                                })
                            }
                        }}
                    >
                        Image from URL
                    </Button>

                    <label
                        htmlFor="uploadPdf"
                        className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                    >
                        Upload PDF
                        <Input
                            id="uploadPdf"
                            accept="application/pdf"
                            type="file"
                            disabled={uploading}
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files?.[0]
                                    if (uploading) return

                                    const reader = new FileReader()
                                    reader.addEventListener(
                                        'load',
                                        async () => {
                                            const url = reader.result as string
                                            setUploading(true)

                                            const pages = []
                                            let pageNumber = 1
                                            const pdfDocument = await getPDFDocument(url)
                                            while (pageNumber <= pdfDocument.numPages) {
                                                const pdfPage = (await createPDFPage(
                                                    pdfDocument,
                                                    pageNumber
                                                )) as PDFPageProxy
                                                const viewport = pdfPage.getViewport({ scale: 2 })
                                                const { height, width } = viewport
                                                const canvas = document.createElement('canvas')
                                                canvas.width = width
                                                canvas.height = height

                                                await renderPDFToCanvas(pdfPage, canvas)
                                                const ctx = canvas.getContext('2d')
                                                if (ctx) {
                                                    pages.push(canvas.toDataURL('image/jpeg'))
                                                }
                                                pageNumber++
                                            }

                                            const additionalSlides: Slide[] = []

                                            for (let i = 0; i < pages.length; i++) {
                                                const page = pages[i]

                                                const { fileName } = await uploadImage({
                                                    base64String: page.replace(
                                                        'data:image/jpeg;base64,',
                                                        ''
                                                    ),
                                                    contentType: 'image/jpeg',
                                                })

                                                const lastSlideIndex =
                                                    (config.slides?.length || 0) + i

                                                console.log(lastSlideIndex, i)

                                                const slideButtons: SlideButton[] = []

                                                if (lastSlideIndex > 0) {
                                                    slideButtons.push({
                                                        text: 'Back',
                                                        type: 'slide',
                                                        target: (lastSlideIndex - 1).toString(),
                                                    })
                                                }

                                                if (i < pages.length - 1) {
                                                    slideButtons.push({
                                                        text: 'Next',
                                                        type: 'slide',
                                                        target: (lastSlideIndex + 1).toString(),
                                                    })
                                                }

                                                const newSlide: Slide = {
                                                    imageUrl:
                                                        process.env.NEXT_PUBLIC_CDN_HOST +
                                                        '/frames/' +
                                                        frameId +
                                                        '/' +
                                                        fileName,
                                                    buttons: slideButtons,
                                                    aspectRatio: '1.91:1',
                                                }

                                                additionalSlides.push(newSlide)
                                            }

                                            updateConfig({
                                                slides: [
                                                    ...(config.slides || []),
                                                    ...additionalSlides,
                                                ],
                                            })

                                            setUploading(false)
                                        },
                                        false
                                    )

                                    reader.readAsDataURL(file)
                                }
                            }}
                            className="sr-only"
                        />
                    </label>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                            updateConfig({ slides: [] })
                        }}
                    >
                        Delete All Slides
                    </Button>
                </div>
            </Configuration.Section>

            {config.slides?.map((slide, iSlide) => (
                <Configuration.Section
                    key={iSlide}
                    title={`Slide #${iSlide + 1}`}
                    actions={[
                        <Button
                            key={iSlide}
                            onClick={() => {
                                if (config.slides.length === 1) {
                                    updateConfig({
                                        slides: undefined,
                                    })
                                    return
                                }

                                const confirmed = confirm(
                                    'Deleting this field will also delete all submissions for this field, are you sure?'
                                )

                                if (confirmed) {
                                    updateConfig({
                                        slides: config.slides.filter((_, i) => i !== iSlide),
                                    })
                                }
                            }}
                            variant="link"
                            size={'sm'}
                        >
                            <Trash size={16} className="text-red-500" />
                        </Button>,
                        <Select
                            key={iSlide + 'select'}
                            className="p-0 pl-2 border-0 bg-transparent h-fit w-14 focus:ring-0"
                            defaultValue={slide.aspectRatio}
                            placeholder="Select an aspect ratio"
                            onChange={(newValue) => {
                                updateConfig({
                                    slides: config.slides.map((slide, i) =>
                                        i === iSlide
                                            ? {
                                                  ...slide,
                                                  aspectRatio: newValue,
                                              }
                                            : slide
                                    ),
                                })
                            }}
                        >
                            <option key="1:1" value="1:1">
                                1:1
                            </option>
                            <option key="1.91:1" value="1.91:1">
                                1.91:1
                            </option>
                        </Select>,
                    ]}
                >
                    {/* <p>{JSON.stringify(slide)}</p> */}
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-col w-1/4">
                                <img
                                    src={slide.imageUrl}
                                    alt="Slide"
                                    className="h-full w-full object-contain"
                                />
                                <label
                                    htmlFor={`replaceImage-${iSlide}`}
                                    className="flex flex-1 cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                                >
                                    Replace Image
                                    <Input
                                        id={`replaceImage-${iSlide}`}
                                        accept="image/*"
                                        type="file"
                                        disabled={uploading}
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files?.[0]
                                                if (uploading) return

                                                setUploading(true)

                                                const reader = new FileReader()
                                                reader.readAsDataURL(file)

                                                const base64String = (await new Promise(
                                                    (resolve) => {
                                                        reader.onload = () => {
                                                            const base64String = (
                                                                reader.result as string
                                                            ).split(',')[1]
                                                            resolve(base64String)
                                                        }
                                                    }
                                                )) as string

                                                const contentType = e.target.files[0].type as
                                                    | 'image/png'
                                                    | 'image/jpeg'
                                                    | 'image/gif'
                                                    | 'image/webp'

                                                const { fileName } = await uploadImage({
                                                    base64String: base64String,
                                                    contentType: contentType,
                                                })

                                                updateConfig({
                                                    slides: config.slides.map((slide, i) =>
                                                        i === iSlide
                                                            ? {
                                                                  ...slide,
                                                                  imageUrl:
                                                                      process.env
                                                                          .NEXT_PUBLIC_CDN_HOST +
                                                                      '/frames/' +
                                                                      frameId +
                                                                      '/' +
                                                                      fileName,
                                                              }
                                                            : slide
                                                    ),
                                                })

                                                setUploading(false)
                                            }
                                        }}
                                        className="sr-only "
                                    />
                                </label>
                            </div>

                            <div className="flex flex-col justify-between w-3/4 gap-1">
                                {Array.from({ length: 4 }).map((_, iButtons) => (
                                    <div
                                        key={iButtons}
                                        className="flex flex-row items-center gap-1"
                                    >
                                        {!config.slides[iSlide].buttons?.[iButtons] ? (
                                            <div className="flex items-center w-full">
                                                <Select
                                                    key={iButtons + 'select-active-button-type'}
                                                    onChange={(newValue) => {
                                                        // add this button
                                                        const updatedButtons = [
                                                            ...config.slides[iSlide].buttons,
                                                            {
                                                                type: newValue,
                                                                target: '',
                                                            },
                                                        ]

                                                        updateConfig({
                                                            slides: config.slides.map((slide, i) =>
                                                                i === iSlide
                                                                    ? {
                                                                          ...slide,
                                                                          buttons: updatedButtons,
                                                                      }
                                                                    : slide
                                                            ),
                                                        })
                                                    }}
                                                    placeholder="Select a type to enable this button"
                                                >
                                                    <option key="active-link" value="link">
                                                        Link
                                                    </option>
                                                    <option key="active-slide" value="slide">
                                                        Slide
                                                    </option>
                                                    <option key="active-frame" value="frame">
                                                        Frame
                                                    </option>
                                                </Select>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center w-1/5">
                                                    <Select
                                                        key={iButtons + 'select-button-type'}
                                                        defaultValue={
                                                            config.slides[iSlide].buttons?.[
                                                                iButtons
                                                            ]?.type
                                                        }
                                                        onChange={(newValue) => {
                                                            if (newValue === 'disabled') {
                                                                // remove this button
                                                                const updatedButtons =
                                                                    config.slides[
                                                                        iSlide
                                                                    ].buttons.filter(
                                                                        (_, i) => i !== iButtons
                                                                    )

                                                                console.log(
                                                                    'updatedButtons',
                                                                    updatedButtons
                                                                )

                                                                updateConfig({
                                                                    slides: config.slides.map(
                                                                        (slide, i) =>
                                                                            i === iSlide
                                                                                ? {
                                                                                      ...slide,
                                                                                      buttons:
                                                                                          updatedButtons,
                                                                                  }
                                                                                : slide
                                                                    ),
                                                                })
                                                                return
                                                            }

                                                            const existingButton =
                                                                config.slides[iSlide].buttons?.[
                                                                    iButtons
                                                                ]

                                                            if (existingButton) {
                                                                // update this button
                                                                const updatedButtons =
                                                                    config.slides[
                                                                        iSlide
                                                                    ].buttons.map((button, i) =>
                                                                        i === iButtons
                                                                            ? {
                                                                                  ...button,
                                                                                  type: newValue,
                                                                                  target: '',
                                                                              }
                                                                            : button
                                                                    )

                                                                updateConfig({
                                                                    slides: config.slides.map(
                                                                        (slide, i) =>
                                                                            i === iSlide
                                                                                ? {
                                                                                      ...slide,
                                                                                      buttons:
                                                                                          updatedButtons,
                                                                                  }
                                                                                : slide
                                                                    ),
                                                                })
                                                            } else {
                                                                // add this button
                                                                const updatedButtons = [
                                                                    ...config.slides[iSlide]
                                                                        .buttons,
                                                                    {
                                                                        type: newValue,
                                                                        target: '',
                                                                    },
                                                                ]

                                                                updateConfig({
                                                                    slides: config.slides.map(
                                                                        (slide, i) =>
                                                                            i === iSlide
                                                                                ? {
                                                                                      ...slide,
                                                                                      buttons:
                                                                                          updatedButtons,
                                                                                  }
                                                                                : slide
                                                                    ),
                                                                })
                                                            }
                                                        }}
                                                        placeholder="Select type"
                                                    >
                                                        <option key="disabled" value="disabled">
                                                            Disabled
                                                        </option>
                                                        <option key="link" value="link">
                                                            Link
                                                        </option>
                                                        <option key="slide" value="slide">
                                                            Slide
                                                        </option>
                                                        <option key="frame" value="frame">
                                                            Frame
                                                        </option>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center w-2/5">
                                                    {config.slides[iSlide].buttons?.[iButtons]
                                                        ?.type === 'link' && (
                                                        <Input
                                                            defaultValue={
                                                                config.slides[iSlide].buttons?.[
                                                                    iButtons
                                                                ]?.target
                                                            }
                                                            placeholder="URL"
                                                        />
                                                    )}
                                                    {config.slides[iSlide].buttons?.[iButtons]
                                                        ?.type === 'slide' && (
                                                        <Select
                                                            defaultValue={
                                                                config.slides[iSlide].buttons?.[
                                                                    iButtons
                                                                ]?.target
                                                            }
                                                            placeholder="Select slide"
                                                        >
                                                            {config.slides.map(
                                                                (slide, slideIndex) => (
                                                                    <option
                                                                        key={slideIndex}
                                                                        value={slideIndex.toString()}
                                                                        disabled={
                                                                            slideIndex === iSlide
                                                                        }
                                                                    >
                                                                        Slide #{slideIndex + 1}
                                                                    </option>
                                                                )
                                                            )}
                                                        </Select>
                                                    )}
                                                    {config.slides[iSlide].buttons?.[iButtons]
                                                        ?.type === 'frame' && (
                                                        <Input
                                                            defaultValue={
                                                                config.slides[iSlide].buttons?.[
                                                                    iButtons
                                                                ]?.target
                                                            }
                                                            placeholder="Frame URL"
                                                            onChange={(e) => {
                                                                const updatedButtons =
                                                                    config.slides[
                                                                        iSlide
                                                                    ].buttons.map((button, i) => ({
                                                                        ...button,
                                                                        target:
                                                                            i === iButtons
                                                                                ? e.target.value
                                                                                : button.target,
                                                                    }))

                                                                updateConfig({
                                                                    slides: config.slides.map(
                                                                        (slide, i) =>
                                                                            i === iSlide
                                                                                ? {
                                                                                      ...slide,
                                                                                      buttons:
                                                                                          updatedButtons,
                                                                                  }
                                                                                : slide
                                                                    ),
                                                                })
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex items-center w-2/5">
                                                    {config.slides[iSlide].buttons?.[iButtons]
                                                        ?.type && (
                                                        <Input
                                                            defaultValue={
                                                                config.slides[iSlide].buttons?.[
                                                                    iButtons
                                                                ]?.text
                                                            }
                                                            placeholder="Label"
                                                            onChange={(e) => {
                                                                const updatedButtons =
                                                                    config.slides[
                                                                        iSlide
                                                                    ].buttons.map((button, i) => ({
                                                                        ...button,
                                                                        text:
                                                                            i === iButtons
                                                                                ? e.target.value
                                                                                : button.text,
                                                                    }))

                                                                updateConfig({
                                                                    slides: config.slides.map(
                                                                        (slide, i) =>
                                                                            i === iSlide
                                                                                ? {
                                                                                      ...slide,
                                                                                      buttons:
                                                                                          updatedButtons,
                                                                                  }
                                                                                : slide
                                                                    ),
                                                                })
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Configuration.Section>
            ))}
        </Configuration.Root>
    )
}
