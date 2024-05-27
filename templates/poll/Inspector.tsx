'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { useRef } from 'react'
import { X } from 'react-feather'
import type { Config } from '.'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
	const uploadImage = useUploadImage()

    const { options } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const buttonLabelInputRef = useRef<HTMLInputElement>(null)

    const questionInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="w-full h-full flex flex-col gap-5">
            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Question</h2>
                <Input
                    placeholder="The poll question"
                    defaultValue={config.question}
                    onChange={(e) => updateConfig({ question: e.target.value })}
                    className=" py-2 text-lg"
                />
            </div>

            <div className="flex flex-col gap-2 ">
                {options?.map((option, index) => (
                    <div className="flex flex-row justify-between items-center" key={index}>
                        <h2 className="text-lg font-semibold p-2 bg-secondary rounded-md">
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

            {(!options || options.length < 4) && (
                <div className="flex flex-col gap-2 ">
                    <div className="flex flex-col gap-2 ">
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
                        className="w-full bg-border hover:bg-secondary-border text-primary"
                    >
                        Add Option
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-2 ">
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

            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Text Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.textColor || 'white'}
                    setBackground={(value) => updateConfig({ textColor: value })}
                />
            </div>

            <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-semibold">Bar Line Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.barColor || 'yellow'}
                    setBackground={(value) => updateConfig({ barColor: value })}
                />
            </div>
        </div>
    )
}
