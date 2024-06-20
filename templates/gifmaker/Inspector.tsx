'use client'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker, FontFamilyPicker } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { useRef, useState, useEffect } from 'react'
import type { Config } from '.'
import { LoaderPinwheel } from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const logs = useRef(null)
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState(false)

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

    // CREATE GIF FROM PARAMETERS AND SHOW A PREVIEW
    const transcode = async () => {
        try {
            setLoading(true)
            const font = config.fontStyle.replace(/\s/g, '-').toLowerCase()
            const ffmpeg = ffmpegRef.current
            const ty = file.type.substring(file.type.indexOf('/') + 1)
            await ffmpeg.writeFile(`input.${ty}`, await fetchFile(file))
            await ffmpeg.writeFile(
                'font.woff',
                await fetchFile(
                    `https://cdn.jsdelivr.net/npm/@fontsource/${font}@5.0.6/files/${font}-latin-400-normal.woff`
                )
            )
            ffmpeg.exec([
                '-ss',
                config.timeStart,
                '-i',
                `input.${ty}`,
                '-t',
                config.gifDuration,
                '-r',
                '8',
                '-vf',
                `scale=-1:210,drawtext=fontfile=font.woff:text='${config.gifCaption}':fontcolor=${config.fontColor}:bordercolor=black:borderw=1:fontsize=${config.fontSize}:x=(w-text_w)/2:y=(h-text_h)-${config.captionY}`,
                'output.gif',
            ])
            const data = await ffmpeg.readFile('output.gif')
            const b64 = Buffer.from(data).toString('base64')
            const { filePath } = await uploadImage({
                base64String: b64,
                contentType: 'image/gif',
            })
            const gifUrl = process.env.NEXT_PUBLIC_CDN_HOST + '/' + filePath
            updateConfig({
                gifUrl: gifUrl,
            })
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!file) return
        videoRef.current.src = URL.createObjectURL(file)
    }, [file])

    useEffect(() => {
        if (
            !file ||
            !config.timeStart ||
            !config.gifDuration ||
            !config.gifCaption ||
            !config.captionY ||
            !config.fontSize ||
            !config.fontStyle ||
            !config.fontColor
        )
            return
        transcode()
    }, [
        file,
        config.timeStart,
        config.gifDuration,
        config.gifCaption,
        config.captionY,
        config.fontSize,
        config.fontStyle,
        config.fontColor,
    ])

    useEffect(() => {
        updateConfig({
            gifUrl: config?.gifUrl || 'https://iili.io/d9WJ44I.gif',
            timeStart: config?.timeStart || null,
            gifDuration: config?.gifDuration || null,
            gifCaption: config?.gifCaption || null,
            captionY: config?.captionY || null,
            fontSize: config?.fontSize || null,
            fontColor: config?.fontColor || 'white',
            fontStyle: config?.fontStyle || 'ABeeZee',
            buttonLabel: config?.buttonLabel || 'LINK',
            buttonLink: config?.buttonLink || 'https://frametra.in',
        })
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

            <div className="flex items-center justify-center h-7">
                {loading && <LoaderPinwheel className="animate-spin" />}
            </div>

            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-bold">Start Time</h2>
                <Input
                    className="text-lg"
                    placeholder="Seconds or hh:mm:ss"
                    defaultValue={config.timeStart}
                    onChange={(e) => updateConfig({ timeStart: e.target.value })}
                />
                <h2 className="text-lg font-bold">Duration</h2>
                <Input
                    className="text-lg"
                    placeholder="GIF duration in seconds"
                    defaultValue={config.gifDuration}
                    onChange={(e) => updateConfig({ gifDuration: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                    The recommended gif's duration is less 10 sec.
                </p>
                <h2 className="text-lg font-bold">Caption</h2>
                <Input
                    className="text-lg"
                    placeholder="Text on a GIF"
                    defaultValue={config.gifCaption}
                    onChange={(e) => updateConfig({ gifCaption: e.target.value })}
                />
                <h2 className="text-lg font-bold">Caption Positioning</h2>
                <Input
                    className="text-lg"
                    placeholder="Bottom indent of the сaption in pixel values"
                    defaultValue={config.captionY}
                    onChange={(e) => updateConfig({ captionY: e.target.value })}
                />
                <h2 className="text-lg font-bold">Font Size</h2>
                <Input
                    className="text-lg"
                    placeholder="Font size in pixel values"
                    defaultValue={config.fontSize}
                    onChange={(e) => updateConfig({ fontSize: e.target.value })}
                />
                <h2 className="text-lg font-bold">Font Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.fontColor || 'white'}
                    setBackground={(value: string) => updateConfig({ fontColor: value })}
                />
                <h2 className="text-lg font-bold">Font Style</h2>
                <FontFamilyPicker
                    defaultValue={config.fontStyle}
                    onSelect={(font: string) => updateConfig({ fontStyle: font })}
                />
                <h2 className="text-lg font-bold">Button Label</h2>
                <Input
                    className="text-lg"
                    defaultValue={config.buttonLabel}
                    onChange={(e) => updateConfig({ buttonLabel: e.target.value })}
                />
                <h2 className="text-lg font-bold">Button Link</h2>
                <Input
                    className="text-lg"
                    defaultValue={config.buttonLink}
                    onChange={(e) => updateConfig({ buttonLink: e.target.value })}
                />
                <div className="flex items-center justify-center h-7">
                    {loading && <LoaderPinwheel className="animate-spin" />}
                </div>
            </div>
        </div>
    )
}
