'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/Label'
import { Switch } from '@/components/shadcn/Switch'
import { ColorPicker } from '@/sdk/components'
import GatingInspector from '@/sdk/components/gating/GatingInspector'
import { useFarcasterId, useFarcasterName, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useEffect, useRef } from 'react'
import { X } from 'react-feather'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const enabledGating = config.enableGating ?? false
    const fid = useFarcasterId()
    const username = useFarcasterName()

    const { options, gating } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const buttonLabelInputRef = useRef<HTMLInputElement>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!config?.owner) {
            updateConfig({
                owner: {
                    username,
                    fid,
                },
            })
        }
    }, [])

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Question</h2>
                <Input
                    placeholder="The poll question"
                    defaultValue={config.question}
                    onChange={(e) => updateConfig({ question: e.target.value })}
                    className="py-2 text-lg"
                />
            </div>

            {options && (
                <div className="flex flex-col gap-2">
                    {options.map((option, index) => (
                        <div className="flex flex-row justify-between items-center" key={index}>
                            <h2 className="p-2 text-lg font-semibold rounded-md bg-secondary">
                                {option.displayLabel}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    updateConfig({
                                        options: [
                                            ...options.slice(0, index),
                                            ...options.slice(index + 1),
                                        ],
                                    })
                                }
                            >
                                <X />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {(!options || options.length < 4) && (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-lg font-semibold">Voting Options</h1>
                        <Input
                            className="text-lg"
                            placeholder="Results Page Label"
                            ref={displayLabelInputRef}
                        />
                        <Input
                            className="text-lg"
                            placeholder="Button Label"
                            ref={buttonLabelInputRef}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            if (!displayLabelInputRef.current?.value) return
                            if (!buttonLabelInputRef.current?.value) return

                            const optionIndex = options?.length
                                ? Math.max(...options.map((o) => o.index)) + 1
                                : 1

                            const newOptions = [
                                ...(options || []),
                                {
                                    index: optionIndex,
                                    displayLabel: displayLabelInputRef.current.value,
                                    buttonLabel: buttonLabelInputRef.current.value,
                                },
                            ]

                            updateConfig({ options: newOptions })

                            displayLabelInputRef.current.value = ''
                            buttonLabelInputRef.current.value = ''
                        }}
                        className="w-full"
                    >
                        Add Option
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Background Color</h2>
                <ColorPicker
                    className="w-full"
                    enabledPickers={['solid', 'gradient', 'image']}
                    background={
                        config.background || 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                    }
                    setBackground={(value) => updateConfig({ background: value })}
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

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Bar Line Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.barColor || 'yellow'}
                    setBackground={(value) => updateConfig({ barColor: value })}
                />
            </div>

            <div className="flex flex-row items-center justify-between gap-2 ">
                <Label className="font-md" htmlFor="gating">
                    Enable Poll Gating?
                </Label>
                <Switch
                    id="gating"
                    checked={enabledGating}
                    onCheckedChange={(enableGating) => {
                        updateConfig({ enableGating })
                    }}
                />
            </div>

            {enabledGating && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Poll Gating options</h2>
                    <GatingInspector
                        fid={fid}
                        config={config.gating}
                        onUpdate={(option) => {
                            updateConfig({
                                gating: {
                                    ...config.gating,
                                    ...option,
                                },
                            })
                        }}
                    />
                </div>
            )}
        </div>
    )
}
