'use client'

import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Switch } from '@/components/shadcn/Switch'
import { Textarea } from '@/components/shadcn/Textarea'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useState } from 'react'
import UploadSlide from './UploadSlide'
import type { Config } from '../..'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { Textarea } from '@/components/shadcn/Textarea'

type Props = {
    screen: 'cover' | 'success'
}

export default function ScreensConfig({ screen }: Props) {
    const [config, updateConfig] = useFrameConfig<Config>()

    const name = screen === 'cover' ? 'Cover' : 'Ending'
    const data = screen === 'cover' ? config.cover : config.success

    const [descriptionType, setDescriptionType] = useState<'text' | 'image'>(
        data.image ? 'image' : 'text'
    )
    const [customizeStyles, setCustomizeStyles] = useState<Record<string, boolean>>({
        [screen]: !!data.configuration,
    })

    const uploadImage = useUploadImage()

    return (
        <>
            <div className="flex flex-col gap-4 w-full">
                {screen === 'success' && (
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Add an external link(optional)</h2>
                        <Input
                            className="py-2 text-lg "
                            type="url"
                            defaultValue={config.success.url}
                            onChange={(e) => {
                                updateConfig({
                                    success: { ...config.success, url: e.target.value },
                                })
                            }}
                            placeholder="https://warpcast.com/~/channel/frametrain"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">
                        {screen === 'success'
                            ? 'External link Label(optional)'
                            : 'Cover Button Label'}
                    </h2>
                    <Input
                        placeholder={`${name} Label`}
                        defaultValue={data.label}
                        onChange={(e) =>
                            updateConfig({
                                [screen]: {
                                    ...data,
                                    label: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">{name} Screen description type</h2>
                        <RadioGroup
                            defaultValue={descriptionType}
                            className="flex flex-row"
                            onValueChange={(val) => {
                                const value = val as 'image' | 'text'
                                setDescriptionType(value as typeof descriptionType)
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="text" id="text" />
                                <Label htmlFor="text">Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="image" id="image" />
                                <Label htmlFor="image">Image</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex flex-col gap-4 w-full mb-4">
                        {descriptionType === 'image' ? (
                            <div className="flex flex-col gap-2 w-full">
                                <label
                                    htmlFor="cover"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {data?.image ? 'Update' : 'Upload'} your {name} Screen Image
                                </label>
                                <UploadSlide
                                    htmlFor="cover"
                                    setSlide={(image) => {
                                        updateConfig({ [screen]: { ...data, image, text: null } })
                                    }}
                                    uploadSlide={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String,
                                            contentType,
                                        })
                                        return filePath
                                    }}
                                />
                                {config.cover.image ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            updateConfig({
                                                [screen]: { ...data, image: null },
                                            })
                                        }}
                                        className="w-full"
                                    >
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <h2 className="text-lg">{name} Screen description</h2>
                                        <div className="flex flex-row items-center justify-between gap-2 px-4">
                                            <Label
                                                className="font-md"
                                                htmlFor="cover-text-customization"
                                            >
                                                Customize
                                            </Label>
                                            <Switch
                                                checked={customizeStyles[screen]}
                                                onCheckedChange={(checked) => {
                                                    setCustomizeStyles({ [screen]: checked })
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        defaultValue={data?.text}
                                        placeholder={`Your ${name} description`}
                                        onChange={(e) => {
                                            updateConfig({
                                                [screen]: {
                                                    ...data,
                                                    text: e.target.value,
                                                    image: null,
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                {/* Font start */}
                                {customizeStyles[screen] ? (
                                    <>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={data.configuration?.fontFamily}
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                fontFamily: font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Size</h2>
                                            <Input
                                                defaultValue={data.configuration?.fontSize}
                                                placeholder="10px"
                                                onChange={(e) =>
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                fontSize: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Text Color</h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    data.configuration?.textColor || 'white'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                textColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Background Color</h2>
                                            <ColorPicker
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                className="w-full"
                                                background={
                                                    data.configuration?.backgroundColor ||
                                                    'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                backgroundColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    data.configuration?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={data.configuration?.fontFamily}
                                                onSelect={(weight) =>
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                fontWeight: weight,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg">{name} Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    data.configuration?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    data.configuration?.fontStyle || 'normal'
                                                }
                                                onSelect={(style) =>
                                                    updateConfig({
                                                        [screen]: {
                                                            ...data,
                                                            configuration: {
                                                                ...data.configuration,
                                                                fontStyle: style,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
                                ) : null}

                                {/* Font end */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
