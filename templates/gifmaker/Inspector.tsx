'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useRef } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()

    const { gif, video, link, label, start, finish, caption, fontsize, fps, scale } = config

    const inputVideoUrl = useRef<HTMLInputElement>(null)
    const inputStart = useRef<HTMLInputElement>(null)
    const inputFinish = useRef<HTMLInputElement>(null)
    const inputCaption = useRef<HTMLInputElement>(null)
    const inputFontSize = useRef<HTMLInputElement>(null)
    const inputFps = useRef<HTMLInputElement>(null)
    const inputScale = useRef<HTMLInputElement>(null)
    const inputButtonLabel = useRef<HTMLInputElement>(null)
    const inputButtonLink = useRef<HTMLInputElement>(null)
    const logs = useRef(null)

    const confDefault = {
        gif: 'https://i.postimg.cc/fLRwTKnF/roboto.gif',
        video: 'https://www.youtube.com/watch?v=DYCIlghl5rI',
        start: 15,
        finish: 20,
        caption: 'Hello from FrameTrain',
        fontsize: 20,
        fps: 10,
        scale: 320,
        label: 'VIEW',
    }

    return (
        <div className="w-full h-full space-y-4">
            <h1 className="text-lg font-semibold">GIF Maker</h1>

            <p>Simple hit 'Create GIF' button.</p>

            <p>
                Note: Please be patient while the GIF is been creating, approx 10-30 sec. The size
                of the GIF should be less 10 MB to publish to Farcaster. The recommended video length is less 30 min.
            </p>

            <h3 className="text-lg font-semibold">Enter parameters</h3>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Youtube URL (default: https://www.youtube.com/watch?v=DYCIlghl5rI)"
                    ref={inputVideoUrl}
                />
                <Input
                    className="text-lg"
                    placeholder="Start time in sec (default: 15)"
                    ref={inputStart}
                />
                <Input
                    className="text-lg"
                    placeholder="Finish time in sec (default: 20)"
                    ref={inputFinish}
                />
                <Input
                    className="text-lg"
                    placeholder="Caption (default: Hello from FrameTrain)"
                    ref={inputCaption}
                />
                <Input
                    className="text-lg"
                    placeholder="Font size (default: 20)"
                    ref={inputFontSize}
                />
                <Input className="text-lg"
                     placeholder="FPS (default: 10)"
                     ref={inputFps}
                />
                <Input className="text-lg"
                     placeholder="Scale (default: 320)"
                     ref={inputScale}
                />
                <Input
                    className="text-lg"
                    placeholder="Button label (default: VIEW)"
                    ref={inputButtonLabel}
                />
                <Input
                    className="text-lg"
                    placeholder="Button link (default: Video URL + Start time)"
                    ref={inputButtonLink}
                />
                Console: <textarea style={{ color: '#00FFFF' }} ref={logs}></textarea>
                
                <Button
                    onClick={async () => {
                        const params = {
                            video: inputVideoUrl.current?.value || confDefault.video,
                            start: inputStart.current?.value || confDefault.start,
                            finish: inputFinish.current?.value || confDefault.finish,
                            caption: inputCaption.current?.value || confDefault.caption,
                            fontsize: inputFontSize.current?.value || confDefault.fontsize,
                            fps: inputFps.current?.value || confDefault.fps,
                            scale: inputScale.current?.value || confDefault.scale,
                            label: inputButtonLabel.current?.value || confDefault.label,
                            link: inputButtonLink.current?.value || inputVideoUrl.current?.value + '#t=' + inputStart.current?.value,
                        }

                        //updateConfig({ gif: confDefault.gif });
                        logs.current.value = 'Downloading video and creating Gif. Please, wait . . .'

                        //fetch gif url ...
                        try {
                            const resp = await fetch(
                                `https://87.251.66.40/api?url=${params.video}&start=${params.start}&finish=${params.finish}&caption="${params.caption}"&fontsize=${params.fontsize}&fps=${params.fps}&scale=${params.scale}`
                            )
                            const data = await resp.json()
                            console.log(data.url)

                            logs.current.value = `Complited! ${data.url}`

                            updateConfig({
                                gif: data.url,
                                video: params.video,
                                start: params.start,
                                finish: params.finish,
                                caption: params.caption,
                                fontsize: params.fontsize,
                                fps: params.fps,
                                scale: params.scale,
                                label: params.label,
                                link: params.link,
                            })
                        } catch (e) {
                            logs.current.value = `Something went wrong. Check params and try again. ${e}`
                        }
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                Create GIF
            </Button>
            </div>

            <Button
                className="w-full"
                onClick={() => {

                    inputVideoUrl.current.value = config.video || confDefault.video
                    inputStart.current.value = config.start || confDefault.start
                    inputFinish.current.value = config.finish || confDefault.finish
                    inputCaption.current.value = config.caption || confDefault.caption
                    inputFontSize.current.value = config.fontsize || confDefault.fontsize
                    inputFps.current.value = config.fps || confDefault.fps
                    inputScale.current.value = config.scale || confDefault.scale
                    inputButtonLabel.current.value = config.label || confDefault.label
                    inputButtonLink.current.value = config.link || confDefault.video + '#t=' + confDefault.start;

                    logs.current.value = 'Success!'
                }}
            >
                Paste pre-saved
            </Button>

            <Button
                variant="destructive"
                className="w-full "
                onClick={() => {
                    updateConfig({
                        video: null,
                        link: confDefault.video,
                        label: confDefault.label,
                        gif: confDefault.gif,
                        start: null,
                        finish: null,
                        caption: null,
                        fontsize: null,
                        fps: null,
                        scale: null,
                    })

                    logs.current.value = 'The frame has been reseted.'
                }}
            >
                Reset
            </Button>
        </div>
    )
}
