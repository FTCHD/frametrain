'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import type { Config } from '.'
import getPdfDocument, { createPDFPage, renderPDFToCanvas } from './utils'

export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const [responseData, setResponseData] = useState<string[]>([])
    const [file, setFile] = useState<File>()

    useEffect(() => {
        console.log('Triggered useEffect', config.slides)

        if (!config.slides) return

        setResponseData(config.slides)

        console.log('Got stream slides', config.slides)
    }, [config.slides])

    async function renderPdf(url: string) {
        const pages = []
        let pageNumber = 1
        const pdfDocument = await getPdfDocument(url)
        while (pageNumber <= pdfDocument.numPages) {
            const pdfPage = await createPDFPage(pdfDocument, pageNumber)
            const viewport = pdfPage.getViewport({ scale: 1 })
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
        setResponseData(pages)
    }

    useEffect(() => {
        if (!file) return

        const reader = new FileReader()
        reader.addEventListener(
            'load',
            () => {
                renderPdf(reader.result as string)
            },
            false
        )

        reader.readAsDataURL(file)
    }, [file])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        update({ slides: responseData })
    }, [responseData])

    return (
        <div className="w-full h-full gap-4 flex flex-col no-scrollbar">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Cover</h1>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg">Title</h2>
                    <Input
                        defaultValue={config.title}
                        onChange={(e) => update({ title: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg">Subtitle</h2>
                    <Input
                        defaultValue={config.subtitle}
                        onChange={(e) => update({ subtitle: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg">Background Color</h2>
                    <Input
                        defaultValue={config.backgroundColor}
                        onChange={(e) => update({ backgroundColor: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg">Text Color</h2>
                    <Input
                        defaultValue={config.textColor}
                        onChange={(e) => update({ textColor: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-lg">File & Content</h2>
                {!file && !responseData.length && (
                    <label
                        htmlFor="uploadFile"
                        className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Upload a file
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
                )}
                {(file || responseData.length) && (
                    <div className="flex flex-row gap-4">
                        <label
                            htmlFor="uploadFile"
                            className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-primary text-primary-foreground hover:bg-primary/90"
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
                            fullWidth={true}
                            color="danger"
                            onClick={() => {
                                setFile(undefined)
                                update({ slides: [] })
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-lg">Slides</h2>
                <div className="flex flex-row flex-wrap gap-4">
                    {responseData.map((data, i) => (
                        <img key={i} src={data} width={200} height={200} alt="" />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-lg">Aspect Ratio</h2>
                <Select
                    defaultValue={'1/1'}
                    onValueChange={(value) => update({ aspectRatio: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Aspect Ratio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={'1/1'}>Square</SelectItem>
                        <SelectItem value={'1.91/1'}>Wide</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
const FileUploadButton = ({ children, onChange, ...props }) => (
    <Button color="neutral" {...props}>
        {children}
        <input
            type="file"
            accept="application/pdf"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    onChange(e.target.files[0])
                }
            }}
        />
    </Button>
)
