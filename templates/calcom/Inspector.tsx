'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useRef } from 'react'
import type { Config } from '.'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { uploadImage } from '@/sdk/upload'
import { ToggleGroup } from '@radix-ui/react-toggle-group'
import { ToggleGroupItem } from '@/components/shadcn/ToggleGroup'
import { useSession } from 'next-auth/react'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const sesh = useSession()

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const displayLabelDaysRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (apikey: string) => {
        const data = await fetch(`https://api.cal.com/v1/me?apiKey=${apikey}`, {
            method: 'GET',
        })

        const response = await data.json()
        console.log(response.user.name)
        updateConfig({
            name: response.user.name,
            id: response.user.id,
            bio: response.user.bio,
            timeZone: response.user.timeZone,
            username: response.user.username,
            apiKey: apikey,
            fid: sesh.data?.user?.id,
        })
    }

    return (
        <div className="w-full h-full space-y-4">
            <p>{JSON.stringify(config)}</p>
            <h2 className="text-lg font-semibold">Cal.com</h2>

            <h3 className="text-lg font-semibold">cal.com api key</h3>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Enter your cal.com api key"
                    ref={displayLabelInputRef}
                    onChange={() => {
                        handleSubmit(displayLabelInputRef.current!.value)
                    }}
                />

                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Set Maximum Booking Days Ahead</h2>
                    <Input
                        type="number"
                        min={3}
                        max={10}
                        className="text-lg"
                        placeholder="enter between 3 to 10"
                        ref={displayLabelDaysRef}
                        onChange={() => {
                            updateConfig({
                                maxBookingDays: Number(displayLabelDaysRef.current!.value),
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Karma gating</h2>
                    <ToggleGroup type="single">
                        <ToggleGroupItem
                            value="true"
                            onClick={() => {
                                updateConfig({
                                    karmaGating: true,
                                })
                            }}
                        >
                            Enabled
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="false"
                            onClick={() => {
                                updateConfig({
                                    karmaGating: false,
                                })
                            }}
                        >
                            Disabled
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Font</h2>
                    <FontFamilyPicker
                        onSelect={(font) => {
                            updateConfig({
                                fontFamily: font,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Primary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.primaryColor || '#ffffff'}
                        setBackground={(value: string) =>
                            updateConfig({
                                primaryColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Secondary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.secondaryColor || '#000000'}
                        setBackground={(value: string) =>
                            updateConfig({
                                secondaryColor: value,
                            })
                        }
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Title Style</h2>
                    <FontStylePicker
                        currentFont={config?.title?.fontFamily || 'Roboto'}
                        defaultValue={config?.title?.fontStyle || 'normal'}
                        onSelect={(style) =>
                            updateConfig({
                                titleStyle: style,
                            })
                        }
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Title Weight</h2>
                    <FontWeightPicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.fontFamily}
                        onSelect={(weight) =>
                            updateConfig({
                                titleWeight: weight,
                            })
                        }
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.background || '#000000'}
                        setBackground={(e) =>
                            updateConfig({
                                background: e,
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                frameId: frameId,
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
