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
import { ColorPicker, FontStylePicker } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { useRef, useState, useEffect } from 'react'
import type { Config } from '.'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const imageRef = useRef<HTMLImageElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const logs = useRef(null)
    const [file, setFile] = useState<File>()
    const ffmpegRef = useRef(new FFmpeg())

    // LOAD FFMPEG ENGINE
    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        const ffmpeg = ffmpegRef.current

        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
    }

    const inputStart = useRef<HTMLInputElement>(null)
    const inputDuration = useRef<HTMLInputElement>(null)
    const inputCaption = useRef<HTMLInputElement>(null)
    const inputFontSize = useRef<HTMLInputElement>(null)
    const inputY = useRef<HTMLInputElement>(null)
    const inputButtonLabel = useRef<HTMLInputElement>(null)
    const inputButtonLink = useRef<HTMLInputElement>(null)

    const fontStyles = [
        {
            name: 'ABeeZee',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/abeezee@5.0.13/files/abeezee-latin-400-normal.woff',
        },
        {
            name: 'Roboto',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-400-normal.woff',
        },
        {
            name: 'Lobster',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/lobster@5.0.20/files/lobster-latin-400-normal.woff',
        },
        {
            name: 'Orbitron',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/orbitron@5.0.19/files/orbitron-latin-400-normal.woff',
        },
        {
            name: 'Jaro',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/jaro@5.0.1/files/jaro-latin-400-normal.woff',
        },
    ]

    const confDefault = {
        start: '0',
        duration: '10',
        caption: 'Hello from FrameTrain',
        fontSize: '30',
        fontColor: 'white',
        fontStyle: fontStyles[0].url,
        y: '20',
        label: 'Do It',
        link: 'https://frametra.in',
    }

    // CREATE GIF FROM PARAMETERS AND SHOW A PREVIEW
    let data = null
    let params = {}

    const transcode = async () => {
        try {
            logs.current.value = 'Creating GIF. Please wait. . .'
            params = {
                start: inputStart.current?.value.toString() || confDefault.start,
                duration: inputDuration.current?.value.toString() || confDefault.duration,
                caption: inputCaption.current?.value || confDefault.caption,
                y: inputY.current?.value.toString() || confDefault.y,
                fontSize: inputFontSize.current?.value.toString() || confDefault.fontSize,
                fontColor: config.params?.fontColor || confDefault.fontColor,
                fontStyle: config.params?.fontStyle || confDefault.fontStyle,
                label: inputButtonLabel.current?.value || confDefault.label,
                link: inputButtonLink.current?.value || confDefault.link,
            }
            const ffmpeg = ffmpegRef.current
            const ty = file.type.substring(file.type.indexOf('/') + 1)
            await ffmpeg.writeFile(`input.${ty}`, await fetchFile(file))
            await ffmpeg.writeFile('font.woff', await fetchFile(params.fontStyle))
            ffmpeg.exec([
                '-i',
                `input.${ty}`,
                '-ss',
                params.start,
                '-t',
                params.duration,
                '-r',
                '8',
                '-vf',
                `scale=-1:210,drawtext=fontfile=font.woff:text='${params.caption}':fontcolor=${params.fontColor}:bordercolor=black:borderw=1:fontsize=${params.fontSize}:x=(w-text_w)/2:y=(h-text_h)-${params.y}`,
                'output.gif',
            ])

            data = await ffmpeg.readFile('output.gif')
            if (imageRef.current) {
                const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }))
                imageRef.current.src = url
            }
            logs.current.value = 'Successfully!'
        } catch (e) {
            logs.current.value = `Something went wrong. Upload a file and check the parameters. ${JSON.stringify(e)}`
        }
    }

    //CREATE FRAME AND STORE CONFIGURATION
    const create = async () => {
        try {
            if (!data) {
                logs.current.value = 'Preview not found. Hit "Preview" button.'
                return
            }
            logs.current.value = 'Creating Frame . . .'
            const b64 = Buffer.from(data).toString('base64')
            const { filePath } = await uploadImage({
                base64String: b64,
                contentType: 'image/gif',
            })
            const gifUrl = process.env.NEXT_PUBLIC_CDN_HOST + '/' + filePath
            console.log(gifUrl)
            updateConfig({
                gif: gifUrl,
                label: params.label,
                link: params.link,
                params: params,
            })
            logs.current.value = 'Successfully!'
        } catch (e) {
            logs.current.value =
                'Something went wrong. Perhaps, the GIF is too large. Check params and try again.'
        }
    }

    useEffect(() => {
        if (!file) return
        videoRef.current.src = URL.createObjectURL(file)
    }, [file])

    useEffect(() => {
        updateConfig({ time: new Date().toJSON() })
        load()
    }, [])
    return (
        <div className="w-full h-full space-y-4">
            <video ref={videoRef} width="100%" controls></video>
            <label
                htmlFor="uploadFile"
                className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
            >
                Upload a video file
                <Input
                    id="uploadFile"
                    accept="video/*"
                    type="file"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setFile(e.target.files?.[0])
                        }
                    }}
                    className="sr-only"
                />
            </label>

            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-bold">Start Time</h2>
                <Input className="text-lg" placeholder="Seconds or mm:ss" ref={inputStart} />
                <h2 className="text-lg font-bold">Duration</h2>
                <Input
                    className="text-lg"
                    placeholder="GIF duration in seconds"
                    ref={inputDuration}
                />
                <h2 className="text-lg font-bold">Caption</h2>
                <Input className="text-lg" placeholder="Text on a GIF" ref={inputCaption} />
                <h2 className="text-lg font-bold">Caption Positioning</h2>
                <Input
                    className="text-lg"
                    placeholder="Bottom indent of the сaption in pixel values"
                    ref={inputY}
                />
                <h2 className="text-lg font-bold">Font Size</h2>
                <Input
                    className="text-lg"
                    placeholder="Font size in pixel values"
                    ref={inputFontSize}
                />
                <h2 className="text-lg font-bold">Font Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.params?.fontColor || 'white'}
                    setBackground={(value: string) =>
                        updateConfig({
                            params: {
                                ...config.params,
                                fontColor: value,
                            },
                        })
                    }
                />
                <h2 className="text-lg font-bold">Font Style</h2>
                <Select
                    defaultValue={fontStyles[0].url}
                    onValueChange={(value: string) =>
                        updateConfig({
                            params: {
                                ...config.params,
                                fontStyle: value,
                            },
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Aspect Ratio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={fontStyles[0].url}>{fontStyles[0].name}</SelectItem>
                        <SelectItem value={fontStyles[1].url}>{fontStyles[1].name}</SelectItem>
                        <SelectItem value={fontStyles[2].url}>{fontStyles[2].name}</SelectItem>
                        <SelectItem value={fontStyles[3].url}>{fontStyles[3].name}</SelectItem>
                        <SelectItem value={fontStyles[4].url}>{fontStyles[4].name}</SelectItem>
                    </SelectContent>
                </Select>
                <h2 className="text-lg font-bold">Button Label</h2>
                <Input className="text-lg" ref={inputButtonLabel} />
                <h2 className="text-lg font-bold">Button Link</h2>
                <Input className="text-lg" ref={inputButtonLink} />
                <p className="text-sm text-muted-foreground">e.g. https://frametra.in</p>
                <img ref={imageRef} width="100%"></img>
                <br />
                <button
                    onClick={transcode}
                    className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
                >
                    Preview
                </button>
                Console: <textarea style={{ color: '#00FFFF' }} ref={logs}></textarea>
                <p>Note: The recommended gif's duration is less 10 sec.</p>
                <Button
                    onClick={create}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Create Frame
                </Button>
                <Button
                    className="w-full"
                    onClick={() => {
                        const { params } = config
                        inputStart.current.value = config.params?.start || confDefault.start
                        inputDuration.current.value = config.params?.duration || confDefault.duration
                        inputCaption.current.value = config.params?.caption || confDefault.caption
                        inputY.current.value = config.params?.y || confDefault.y
                        inputFontSize.current.value = config.params?.fontSize || confDefault.fontSize
                        inputButtonLabel.current.value = config.params?.label || confDefault.label
                        inputButtonLink.current.value = config.params?.link || confDefault.link
                    }}
                >
                    Pre-saved configuration
                </Button>
            </div>
        </div>
    )
}
