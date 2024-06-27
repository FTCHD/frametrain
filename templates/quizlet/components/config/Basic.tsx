'use client'

import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '../..'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Input } from '@/components/shadcn/Input'
import { Button } from '@/components/shadcn/Button'
import { useEffect, useRef } from 'react'
import { ColorPicker } from '@/sdk/components'
import defaultConfig from '../..'

export default function BasicConfig() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const uploadImage = useUploadImage()
    const yesLabelInputRef = useRef<HTMLInputElement>(null)
    const noLabelInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!yesLabelInputRef.current) return
        if (yesLabelInputRef.current.value) return
        if (!config.results.yesLabel) return

        yesLabelInputRef.current.value = config.results.yesLabel
    }, [config.results.yesLabel])

    useEffect(() => {
        if (!noLabelInputRef.current) return
        if (noLabelInputRef.current.value) return
        if (!config.results.noLabel) return

        noLabelInputRef.current.value = config.results.noLabel
    }, [config.results.noLabel])

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Allow quiz to be answered only once?</h2>
                <Select
                    defaultValue={config.answerOnce ? 'yes' : 'no'}
                    onValueChange={(v: 'yes' | 'no') =>
                        updateConfig({
                            answerOnce: v === 'yes',
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold text-center">Results Options (Optional)</h2>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-medium">Text for Correct answers</h2>
                    <Input
                        className="text-lg"
                        placeholder="Correct answers"
                        ref={yesLabelInputRef}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-medium">Text for Wrong answers</h2>
                    <Input className="text-lg" placeholder="Wrong answers" ref={noLabelInputRef} />
                </div>
                <Button
                    onClick={() => {
                        if (!yesLabelInputRef.current?.value) return
                        if (!noLabelInputRef.current?.value) return

                        updateConfig({
                            results: {
                                ...config.results,
                                yesLabel: yesLabelInputRef.current.value,
                                noLabel: noLabelInputRef.current.value,
                            },
                        })

                        yesLabelInputRef.current.value = ''
                        noLabelInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Save Labels
                </Button>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Slide Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.background ??
                            defaultConfig.initialConfig.results.background
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    background: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Label Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.labelBackground ??
                            defaultConfig.initialConfig.results.labelBackground
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    labelBackground: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Bar color for correct answers</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.yesBarColor ??
                            defaultConfig.initialConfig.results.yesBarColor
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    yesBarColor: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Bar color for wrong answers</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={
                            config.results?.noBarColor ??
                            defaultConfig.initialConfig.results.noBarColor
                        }
                        setBackground={(value) =>
                            updateConfig({
                                results: {
                                    ...config.results,
                                    noBarColor: value,
                                },
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
