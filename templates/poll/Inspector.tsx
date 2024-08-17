'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker } from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useRef, useState } from 'react'
import { X } from 'react-feather'
import type { Config } from '.'
import { Label } from '@/components/shadcn/Label'
import { Switch } from '@/components/shadcn/Switch'
import GatingOptions from '@/sdk/components/GatingOptions'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { corsFetch } from '@/sdk/scrape'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const [enableGating, setEnableGating] = useState<boolean>(config.enableGating ?? false)

    const { options, gating } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const buttonLabelInputRef = useRef<HTMLInputElement>(null)

    const onChangeUsername = useDebouncedCallback(async (username: string) => {
        if (username === '' || username === config.owner?.username) {
            return
        }

        try {
            const response = await corsFetch(
                `https://api.warpcast.com/v2/user-by-username?username=${username}`
            )

            if (!response) return

            const data = JSON.parse(response) as
                | {
                      result: { user: { fid: number; username: string } }
                  }
                | { errors: unknown[] }

            if ('errors' in data) {
                toast.error(`No FID associated with username ${username}`)
                return
            }
            updateConfig({
                owner: {
                    fid: data.result.user.fid,
                    username: data.result.user.username,
                },
            })
        } catch {
            toast.error('Failed to fetch FID')
        }
    }, 1000)

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Your Farcaster username</h2>
                <Input
                    className="w-full"
                    placeholder="eg. vitalik.eth"
                    defaultValue={config.owner?.username}
                    onChange={async (e) => onChangeUsername(e.target.value)}
                />
            </div>
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
                        variant={'primary'}
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
                    checked={enableGating}
                    onCheckedChange={(checked) => {
                        if (checked && !config.owner) {
                            toast.error(
                                'Please configure your farcaster username before enabling Poll Gating'
                            )
                            return
                        }
                        setEnableGating(checked)
                    }}
                />
            </div>

            {enableGating && gating && (
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Poll Gating options</h2>
                    <GatingOptions
                        onUpdate={(option) => {
                            if (option.channels) {
                                updateConfig({
                                    gating: {
                                        ...gating,
                                        channels: {
                                            ...gating.channels,
                                            data: option.channels.data,
                                        },
                                    },
                                })
                            } else {
                                updateConfig({
                                    gating: {
                                        ...config.gating,
                                        ...option,
                                    },
                                })
                            }
                        }}
                        config={gating}
                    />
                </div>
            )}
        </div>
    )
}
