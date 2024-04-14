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
        <div className=" h-full space-y-8 flex flex-col">
            <div className="w-full h-full space-y-4 flex flex-col">
                <h1 className="text-2xl font-bold">Cover</h1>
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">Title</h2>
                    <Input
                        className="py-2 text-lg  w-96"
                        defaultValue={config.title}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Title"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">Subtitle</h2>
                    <Input
                        className="py-2 text-lg  w-96"
                        defaultValue={config.subtitle}
                        onChange={(e) => update({ subtitle: e.target.value })}
                        placeholder="Subtitle"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">Background Color</h2>
                    <Input
                        className="py-2 text-lg w-96"
                        defaultValue={config.backgroundColor}
                        onChange={(e) => update({ backgroundColor: e.target.value })}
                        placeholder="red"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <h2 className="text-lg font-semibold">Text Color</h2>
                    <Input
                        className="py-2 text-lg  w-96"
                        defaultValue={config.textColor}
                        onChange={(e) => update({ textColor: e.target.value })}
                        placeholder="blue"
                    />
                </div>
            </div>
            <div className="flex flex-col space-y-4 ">
                <h2 className="text-2xl font-bold">File & Content</h2>
                {!file && !responseData.length && (
                    <label
                        htmlFor="uploadFile"
                        className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
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
                            className="sr-only w-96"
                        />
                    </label>
                )}
                {(file || responseData.length) && (
                    <div className="flex flex-row space-x-4 w-full">
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
                                className="sr-only w-80"
                            />
                        </label>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setFile(undefined)
                                update({ slides: [] })
                            }}
                            className="w-full"
                        >
                            Remove
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-semibold">Slides</h2>
                <div className="flex flex-row flex-wrap gap-4">
                    {responseData.map((data, i) => (
                        <img key={i} src={data} width={200} height={200} alt="" />
                    ))}
                </div>
            </div>
            <div className="flex flex-col space-y-4 ">
                <h2 className="text-lg font-semibold">Aspect Ratio</h2>
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