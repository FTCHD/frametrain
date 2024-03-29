'use client'
import { Button, Input, Option, Select, Stack, SvgIcon, Typography, styled } from '@mui/joy'
import { useEffect, useState } from 'react'
import type { Config } from '.'
import getPdfDocument, { createPDFPage, renderPDFToCanvas } from './utils'

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`

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
        <Stack width={'100%'} height={'100%'} gap={2}>
            <Stack direction={'column'} gap={2}>
                <Typography level="h2">Cover</Typography>
                <Stack direction={'column'} gap={2}>
                    <Typography level="title-lg">Title</Typography>
                    <Input
                        size="lg"
                        defaultValue={config.title}
                        onChange={(e) => update({ title: e.target.value })}
                    />
                </Stack>
                <Stack direction={'column'} gap={2}>
                    <Typography level="title-lg">Subtitle</Typography>
                    <Input
                        size="lg"
                        defaultValue={config.subtitle}
                        onChange={(e) => update({ subtitle: e.target.value })}
                    />
                </Stack>
                <Stack direction={'column'} gap={2}>
                    <Typography level="title-lg">Background Color</Typography>
                    <Input
                        size="lg"
                        defaultValue={config.backgroundColor}
                        onChange={(e) => update({ backgroundColor: e.target.value })}
                    />
                </Stack>
                <Stack direction={'column'} gap={2}>
                    <Typography level="title-lg">Text Color</Typography>
                    <Input
                        size="lg"
                        defaultValue={config.textColor}
                        onChange={(e) => update({ textColor: e.target.value })}
                    />
                </Stack>
            </Stack>
            <Stack direction={'column'} gap={2}>
                <Typography level="h2">File & Content</Typography>
                {!file && !responseData.length && (
                    <Button
                        component="label"
                        variant="outlined"
                        color="neutral"
                        startDecorator={
                            <SvgIcon>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                    />
                                </svg>
                            </SvgIcon>
                        }
                    >
                        Upload a file
                        <VisuallyHiddenInput
                            accept="application/pdf"
                            type="file"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setFile(e.target.files?.[0])
                                }
                            }}
                        />
                    </Button>
                )}
                {(file || responseData.length) && (
                    <Stack direction={'row'} gap={2}>
                        <Button
                            fullWidth={true}
                            component="label"
                            variant="outlined"
                            color="neutral"
                            startDecorator={
                                <SvgIcon>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                        />
                                    </svg>
                                </SvgIcon>
                            }
                        >
                            Upload another file
                            <VisuallyHiddenInput
                                accept="application/pdf"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFile(e.target.files?.[0])
                                    }
                                }}
                            />
                        </Button>
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
                    </Stack>
                )}
            </Stack>
            <Stack direction={'column'} gap={2}>
                <Typography level="title-lg">Slides</Typography>
                <Stack direction={'row'} gap={2} flexWrap={'wrap'}>
                    {responseData.map((data, i) => (
                        <img key={i} src={data} width={200} height={200} alt="" />
                    ))}
                </Stack>
            </Stack>
            <Stack direction={'column'} gap={2}>
                <Typography level="title-lg">Aspect Ratio</Typography>
                <Select
                    placeholder="Aspect Ratio"
                    size="lg"
                    defaultValue={'1/1'}
                    variant="outlined"
                    onChange={(_: React.SyntheticEvent | null, newValue: string | null) =>
                        update({ aspectRatio: newValue ?? '1/1' })
                    }
                >
                    <Option value={'1/1'}>Square</Option>
                    <Option value={'1.91/1'}>Wide</Option>
                </Select>
            </Stack>
        </Stack>
    )
}
