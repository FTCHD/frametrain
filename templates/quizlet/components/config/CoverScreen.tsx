'use client'
import {
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    Input,
    Label,
    RadioGroup,
    Switch,
    Textarea,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useState } from 'react'
import type { Config } from '../..'
import UploadSlide from './UploadSlide'

export default function CoverScreen() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const [descriptionType, setDescriptionType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [customizeStyles, setCustomizeStyles] = useState(!!config.cover.configuration)

    const uploadImage = useUploadImage()

    return (
        <>
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Button Label</h2>
                    <Input
                        placeholder={'Cover Label'}
                        defaultValue={config.cover.label}
                        onChange={(e) =>
                            updateConfig({
                                cover: {
                                    ...config.cover,
                                    label: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Screen Type</h2>
                        <RadioGroup.Root
                            defaultValue={descriptionType}
                            className="flex flex-row"
                            onValueChange={(val) => {
                                const value = val as 'image' | 'text'
                                setDescriptionType(value as typeof descriptionType)
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="text" id="text" />
                                <Label htmlFor="text">Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroup.Item value="image" id="image" />
                                <Label htmlFor="image">Image</Label>
                            </div>
                        </RadioGroup.Root>
                    </div>
                    <div className="flex flex-col gap-4 w-full mb-4">
                        {descriptionType === 'image' ? (
                            <div className="flex flex-col gap-2 w-full">
                                <label
                                    htmlFor="cover"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    {config.cover?.image ? 'Update' : 'Upload'} Image
                                </label>
                                <UploadSlide
                                    htmlFor="cover"
                                    setSlide={(image) => {
                                        updateConfig({
                                            cover: { ...config.cover, image, text: null },
                                        })
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
                                                cover: { ...config.cover, image: null },
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
                                                htmlFor="cover-text-customization"
                                            >
                                                Customize
                                            </Label>
                                            <Switch
                                                checked={customizeStyles}
                                                onCheckedChange={(checked) => {
                                                    setCustomizeStyles(checked)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Textarea
                                        defaultValue={config.cover?.text}
                                        placeholder={'Your Cover description'}
                                        onChange={(e) => {
                                            updateConfig({
                                                cover: {
                                                    ...config.cover,
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
                                            <h2 className="text-lg font-semibold">Cover Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.cover.configuration?.fontFamily
                                                }
                                                onSelect={(font) => {
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontFamily: font,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Size</h2>
                                            <Input
                                                defaultValue={config.cover.configuration?.fontSize}
                                                placeholder="10px"
                                                onChange={(e) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontSize: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Cover Text Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.cover.configuration?.textColor || 'white'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                textColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Cover Background Color
                                            </h2>
                                            <ColorPicker
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                className="w-full"
                                                background={
                                                    config.cover.configuration?.backgroundColor ||
                                                    'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)'
                                                }
                                                setBackground={(color: string) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                backgroundColor: color,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.cover.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover.configuration?.fontFamily
                                                }
                                                onSelect={(weight) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
                                                                fontWeight: weight,
                                                            },
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Cover Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.cover.configuration?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.cover.configuration?.fontStyle ||
                                                    'normal'
                                                }
                                                onSelect={(style) =>
                                                    updateConfig({
                                                        cover: {
                                                            ...config.cover,
                                                            configuration: {
                                                                ...config.cover.configuration,
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
