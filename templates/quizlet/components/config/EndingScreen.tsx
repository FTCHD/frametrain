'use client'

import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import React, { useState } from 'react'
import { Config } from '../..'
import { Input } from '@/components/shadcn/Input'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Label } from '@/components/shadcn/InputLabel'
import UploadSlide from './UploadSlide'
import { Button } from '@/components/shadcn/Button'
import { Switch } from '@/components/shadcn/Switch'
import { Textarea } from '@/components/shadcn/Textarea'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'

export default function EndingScreen() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const [descriptionType, setDescriptionType] = useState<'text' | 'image'>(
        config.success.image ? 'image' : 'text'
    )
    const [customizeStyles, setCustomizeStyles] = useState( !!config.success.configuration,
    )

    const uploadImage = useUploadImage()

    return (
        <>
            <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">External Link</h2>
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
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">
                        Link Label
                    </h2>
                    <Input
                        placeholder={`Ending Label`}
                        defaultValue={config.success.label}
                        onChange={(e) =>
                            updateConfig({
                                success: {
                                    ...config.success,
                                    label: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Screen Type</h2>
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
                                    htmlFor="image"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {config.success?.image ? 'Update' : 'Upload'} Image
                                </label>
                                <UploadSlide
                                    htmlFor="image"
                                    setSlide={(image) => {
                                        updateConfig({ success: { ...config.success, image, text: null } })
                                    }}
                                    uploadSlide={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String,
                                            contentType,
                                        })
                                        return filePath
                                    }}
                                />
                                {config.success.image ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            updateConfig({
                                                success: { ...config.success, image: null },
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
                                        <h2 className="text-lg font-semibold">Description</h2>
                                        <div className="flex flex-row items-center justify-between gap-2 px-4">
                                            <Label
                                                className="font-md"
                                                htmlFor="image-text-customization"
                                            >
                                                Customize
                                            </Label>
                                            <Switch
                                                checked={customizeStyles}
                                                onCheckedChange={(checked) => {
                                                    setCustomizeStyles(checked )
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        defaultValue={config.success?.text}
                                        placeholder={`Your $Ending description`}
                                        onChange={(e) => {
                                            updateConfig({
                                                success: {
                                                    ...config.success,
                                                    text: e.target.value,
                                                    image: null,
                                                },
                                            })
                                        }}
                                    />
                                </div>
                                {/* Font start */}
                                {customizeStyles ? (
                                    <>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={config.success.configuration?.fontFamily}
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontFamily: font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Size</h2>
                                            <Input
                                                defaultValue={config.success.configuration?.fontSize}
                                                placeholder="10px"
                                                onChange={(e) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontSize: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Ending Text Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.success.configuration?.textColor || 'white'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                textColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Ending Background Color
                                            </h2>
                                            <ColorPicker
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                className="w-full"
                                                background={
                                                    config.success.configuration?.backgroundColor ||
                                                    'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                backgroundColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.success.configuration?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={config.success.configuration?.fontFamily}
                                                onSelect={(weight) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontWeight: weight,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Ending Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.success.configuration?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.success.configuration?.fontStyle || 'normal'
                                                }
                                                onSelect={(style) =>
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            configuration: {
                                                                ...config.success.configuration,
                                                                fontStyle: style,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
