'use client'
import { Button, ColorPicker, Input, Select } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { LoaderIcon } from 'lucide-react'
import type { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces'
import { useEffect, useState } from 'react'
import type { Config } from '.'
import getPdfDocument, { createPDFPage, renderPDFToCanvas } from './utils'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()

    const [file, setFile] = useState<File>()

    const [uploadingSlides, setUploadingSlides] = useState(false)

    useEffect(() => {
        if (!file) return
        if (uploadingSlides) return

        const reader = new FileReader()
        reader.addEventListener(
            'load',
            async () => {
                const url = reader.result as string
                setUploadingSlides(true)

                const pages = []
                let pageNumber = 1
                const pdfDocument = await getPdfDocument(url)
                while (pageNumber <= pdfDocument.numPages) {
                    const pdfPage = (await createPDFPage(pdfDocument, pageNumber)) as PDFPageProxy
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

                const slideUrls = []
                // biome-ignore lint/style/useForOf: <explanation>
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i]

                    const { fileName } = await uploadImage({
                        base64String: page.replace('data:image/jpeg;base64,', ''),
                        contentType: 'image/jpeg',
                    })

                    slideUrls.push('/frames/' + frameId + '/' + fileName)
                }

                updateConfig({ slideUrls: slideUrls })

                setUploadingSlides(false)

                setFile(undefined)
            },
            false
        )

        reader.readAsDataURL(file)
    }, [file, frameId, updateConfig, uploadingSlides, uploadImage])

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Title</h2>
                    <Input
                        className="py-2 text-lg "
                        defaultValue={config.title}
                        onChange={(e) => updateConfig({ title: e.target.value || undefined })}
                        placeholder="Title"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Subtitle</h2>
                    <Input
                        className="py-2 text-lg "
                        defaultValue={config.subtitle}
                        onChange={(e) => updateConfig({ subtitle: e.target.value || undefined })}
                        placeholder="Subtitle"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.backgroundColor || 'black'}
                        setBackground={(value) => updateConfig({ backgroundColor: value })}
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
            </Configuration.Section>
            <Configuration.Section title="File & Content">
                {!config?.slideUrls?.length ? (
                    <div className="flex flex-row justify-between items-center">
                        <label
                            htmlFor="uploadFile"
                            className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
                        >
                            Upload a file
                            <Input
                                id="uploadFile"
                                accept="application/pdf"
                                type="file"
                                disabled={uploadingSlides}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFile(e.target.files?.[0])
                                    }
                                }}
                                className="sr-only"
                            />
                        </label>

                        {uploadingSlides && <LoaderIcon className="animate-spin" />}
                    </div>
                ) : (
                    <div className="flex flex-row space-x-4 w-full">
                        {uploadingSlides && <LoaderIcon className="animate-spin" />}
                        <label
                            htmlFor="uploadFile"
                            className="flex w-full cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border text-primary hover:bg-secondary-border"
                        >
                            Upload Another file
                            <Input
                                id="uploadFile"
                                accept="application/pdf"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFile(e.target.files?.[0])
                                    }
                                }}
                                className="sr-only"
                            />
                        </label>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                updateConfig({ slideUrls: [] })
                            }}
                            className="w-full"
                        >
                            Remove
                        </Button>
                    </div>
                )}
            </Configuration.Section>
            <Configuration.Section title="Slides">
                <div className="flex flex-row flex-wrap gap-4">
                    {config?.slideUrls?.length ? (
                        config?.slideUrls?.map((slideUrl) => (
                            <img
                                key={slideUrl}
                                src={process.env.NEXT_PUBLIC_CDN_HOST + slideUrl}
                                width={200}
                                height={200}
                                alt="PDF Slide"
                            />
                        ))
                    ) : (
                        <h1 className="text-lg">No slides uploaded</h1>
                    )}
                </div>
            </Configuration.Section>
            <Configuration.Section title="Aspect Ratio">
                <Select
                    defaultValue={config.aspectRatio}
                    onChange={(value) => updateConfig({ aspectRatio: value })}
                >
                    <option value={'1/1'}>Square</option>
                    <option value={'1.91/1'}>Wide</option>
                </Select>
            </Configuration.Section>
        </Configuration.Root>
    )
}
