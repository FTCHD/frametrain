'use client'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker, FontFamilyPicker } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { useRef, useState, useEffect } from 'react'
import type { Config } from '.'
import { LoaderPinwheel } from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { getVideo, getInfo } from './lib/ytdl'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [loading, setLoading] = useState(false)
    const ffmpegRef = useRef(new FFmpeg())
    const [source, setSource] = useState<string>('file')
    const [file, setFile] = useState<File>()
    const [link, setLink] = useState<string>('')

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
            let ty = 'mp4'
            let video = null
            setLoading(true)

            if (source == 'link') {
                const videoBase64 = await getVideo(link)
                video = `data:video/${ty};base64,${videoBase64}`
            }

            if (source == 'file') {
                ty = file?.type.substring(file.type.indexOf('/') + 1)
                video = file
            }

            const font = config.fontStyle.replace(/\s/g, '-').toLowerCase()
            const ffmpeg = ffmpegRef.current
            await ffmpeg.writeFile(`input.${ty}`, await fetchFile(video))
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
                `scale=-1:210,drawtext=fontfile=font.woff:text='${config.gifCaption || ' '}':fontcolor=${config.fontColor}:bordercolor=black:borderw=1:fontsize=${config.fontSize || '0'}:x=(w-text_w)/2:y=(h-text_h)-${config.captionY || '0'}`,
                'output.gif',
            ])

            const data = await ffmpeg.readFile('output.gif')
            const b64 = Buffer.from(data).toString('base64')
            const { filePath } = await uploadImage({
                base64String: b64,
                contentType: 'image/gif',
            })
            const gifUrl = process.env.NEXT_PUBLIC_CDN_HOST + '/' + filePath
            updateConfig({ gifUrl: gifUrl })
        } catch (e) {
            console.log(e)
        } finally {
            setTimeout(setLoading, 3000, false)
        }
    }

    useEffect(() => {
        if (source == 'file') videoRef.current.src = file ? URL.createObjectURL(file) : ''
    }, [file, source])

    useEffect(() => {
        if (source == 'link') videoRef.current.src = link
    }, [link, source])

    useEffect(() => {
        async function info() {
            try {
                let data = await getInfo(config.youtubeUrl)
                setLink(JSON.parse(data).url)
            } catch {
                setLink('')
            }
        }
        info()
    }, [config.youtubeUrl])

    useEffect(() => {
        if (
            ((source == 'link' && link) || (source == 'file' && file)) &&
            config.timeStart &&
            config.gifDuration &&
            config.fontStyle &&
            config.fontColor &&
            ((config.gifCaption && config.fontSize && config.captionY) || !config.gifCaption)
        )
            transcode()
    }, [
        file,
        link,
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
            fontColor: config?.fontColor || 'white',
            fontStyle: config?.fontStyle || 'ABeeZee',
            buttonLabel: config?.buttonLabel || 'LINK',
            buttonLink: config?.buttonLink || 'https://frametra.in',
        })
        load()
    }, [])

    return (
        <div className="w-full h-full space-y-4">
            <video
                class="border-solid border-2 rounded-lg border-gray-500"
                ref={videoRef}
                width="100%"
                controls
            ></video>

            <div className="flex items-center justify-center h-5">
                {loading && <LoaderPinwheel className="animate-spin" />}
            </div>

            <div class="block w-full" onChange={(event) => setSource(event.target.value)}>
                <label for="source" class="block mb-2 text-lg font-bold w-full">
                    Video source
                </label>
                <select
                    id="source"
                    class="h-12 border border-gray-500 text-lg rounded-lg block w-full py-2.5 px-4 focus:outline-none"
                >
                    <option value="file" selected>File</option>
                    <option value="link">YouTube</option>
                </select>
            </div>

            <div className={`space-y-2 ${source == 'file' ? 'visible' : 'hidden'}`}>
                <label
                    htmlFor="uploadFile"
                    className="flex cursor-pointer items-center justify-center rounded-md  py-2.5 px-2 text-lg font-medium bg-border  text-primary hover:bg-secondary-border"
                >
                    Upload a video file
                    <Input
                        id="uploadFile"
                        accept="video/*"
                        type="file"
                        onChange={(e) => {
                            setFile(e.target.files?.[0])
                        }}
                        className="sr-only"
                    />
                </label>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>

            <div className="flex text-lg flex-col gap-2 ">
                <div className={`space-y-2 ${source == 'link' ? 'visible' : 'hidden'}`}>
                    <h2 className="font-bold">YouTube video URL</h2>
                    <Input
                        className="bg-red-800"
                        placeholder="https://www.youtube.com/watch?v= . . ."
                        defaultValue={config.youtubeUrl}
                        onChange={(e) => {
                            updateConfig({ youtubeUrl: e.target.value })
                        }}
                    />
                </div>

                <h2 className="font-bold">Start Time</h2>
                <Input
                    placeholder="Seconds or mm:ss"
                    defaultValue={config.timeStart}
                    onChange={(e) => updateConfig({ timeStart: e.target.value })}
                />
                <h2 className="font-bold">Duration</h2>
                <Input
                    placeholder="GIF duration in seconds"
                    defaultValue={config.gifDuration}
                    onChange={(e) => updateConfig({ gifDuration: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                    The recommended gif's duration is less 10 sec.
                </p>
                <h2 className="font-bold">Caption</h2>
                <Input
                    placeholder="Text on a GIF"
                    defaultValue={config.gifCaption}
                    onChange={(e) => updateConfig({ gifCaption: e.target.value })}
                />
                <h2 className="font-bold">Caption Positioning</h2>
                <Input
                    placeholder="Bottom indent of the сaption in pixel values"
                    defaultValue={config.captionY}
                    onChange={(e) => updateConfig({ captionY: e.target.value })}
                />
                <h2 className="font-bold">Font Size</h2>
                <Input
                    placeholder="Font size in pixel values"
                    defaultValue={config.fontSize}
                    onChange={(e) => updateConfig({ fontSize: e.target.value })}
                />
                <h2 className="font-bold">Font Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.fontColor || 'white'}
                    setBackground={(value: string) => updateConfig({ fontColor: value })}
                />
                <h2 className="font-bold">Font Style</h2>
                <FontFamilyPicker
                    defaultValue={config.fontStyle}
                    onSelect={(font: string) => updateConfig({ fontStyle: font })}
                />
                <h2 className="font-bold">Button Label</h2>
                <Input
                    defaultValue={config.buttonLabel}
                    onChange={(e) => updateConfig({ buttonLabel: e.target.value })}
                />
                <h2 className="font-bold">Button Link</h2>
                <Input
                    defaultValue={config.buttonLink}
                    onChange={(e) => updateConfig({ buttonLink: e.target.value })}
                />
                <div className="flex items-center justify-center">
                    {loading && <LoaderPinwheel className="animate-spin" />}
                </div>
            </div>
        </div>
    )
}
