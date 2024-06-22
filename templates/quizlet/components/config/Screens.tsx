'use client'

import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Switch } from '@/components/shadcn/Switch'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useEffect, useRef, useState } from 'react'
import UploadSlide from './UploadSlide'
import type { Config } from '../..'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { Textarea } from '@/components/shadcn/Textarea'

export default function ScreensConfig() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [customizeCover, setCustomizeCover] = useState(!!config.cover.configuration)

    const coverLabelInputref = useRef<HTMLInputElement>(null)
    const successLabelInputref = useRef<HTMLInputElement>(null)
    const coverDescriptionRef = useRef<string | null>(null)
    const coverFontSizeInputref = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()

    useEffect(() => {
        if (!successLabelInputref.current) return
        if (successLabelInputref.current.value) return
        if (!config.success.label) return

        successLabelInputref.current.value = config.success.label
    }, [config.success.label])

    useEffect(() => {
        if (!coverLabelInputref.current) return
        if (coverLabelInputref.current.value) return
        if (!config.cover.label) return

        coverLabelInputref.current.value = config.cover.label
    }, [config.cover.label])

    useEffect(() => {
        if (!coverDescriptionRef.current) return
        if (coverDescriptionRef.current) return
        if (!config.cover.text) return

        coverDescriptionRef.current = config.cover.text
    }, [config.cover.text])

    useEffect(() => {
        if (!coverFontSizeInputref.current) return
        if (coverFontSizeInputref.current.value) return
        if (config.cover.image) return
        if (!config.cover.configuration?.fontSize) return

        coverFontSizeInputref.current.value = config.cover.configuration.fontSize
    }, [config.cover])

    return (
        <>
            <div className="flex flex-col gap-4 w-full">
                <h2 className="text-lg text-center font-bold">Cover Screen</h2>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Cover Button Label</h2>
                    <Input ref={coverLabelInputref} placeholder="Cover Label" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Type of Cover</h2>
                    <RadioGroup
                        defaultValue={coverType}
                        className="flex flex-row"
                        onValueChange={(value) => {
                            console.log('Cover Type', value)

                            setCoverType(value as typeof coverType)
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
                <div className="flex flex-col gap-4 w-full">
                    {coverType === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="cover"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.cover?.image ? 'Update' : 'Upload'} your Cover Image image
                            </label>
                            <UploadSlide
                                htmlFor="cover"
                                setSlide={(image) => {
                                    updateConfig({ cover: { ...config.cover, image } })
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
                                            cover: { ...config.success, image: null },
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
                                    <h2 className="text-lg">Add Cover text</h2>
                                    <div className="flex flex-row items-center justify-between gap-2 px-4">
                                        <Label
                                            className="font-md"
                                            htmlFor="cover-text-customization"
                                        >
                                            Customize
                                        </Label>
                                        <Switch
                                            checked={customizeCover}
                                            onCheckedChange={(checked) => {
                                                setCustomizeCover(checked)
                                            }}
                                        />
                                    </div>
                                </div>
                                <Textarea
                                    defaultValue={config.cover?.text}
                                    placeholder="Your cover description"
                                    onChange={(e) => {
                                        coverDescriptionRef.current = e.target.value
                                    }}
                                />
                            </div>
                            {/* Font start */}
                            {customizeCover ? (
                                <>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Font</h2>
                                        <FontFamilyPicker
                                            onSelect={(font) => {
                                                updateConfig({
                                                    cover: {
                                                        ...config,
                                                        configuration: {
                                                            ...config.configuration,
                                                            fontFamily: font,
                                                        },
                                                    },
                                                })
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Size</h2>
                                        <Input
                                            ref={coverFontSizeInputref}
                                            placeholder="10px"
                                            onChange={(e) =>
                                                updateConfig({
                                                    cover: {
                                                        ...config.cover,
                                                        configuration: {
                                                            ...config.configuration,
                                                            fontSize: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            // size={70}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Text Color</h2>
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
                                                            ...config.configuration,
                                                            textColor: color,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Background Color</h2>
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
                                                            ...config.configuration,
                                                            backgroundColor: color,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Weight</h2>
                                        <FontWeightPicker
                                            currentFont={
                                                config.cover.configuration?.fontFamily || 'Roboto'
                                            }
                                            defaultValue={config.cover.configuration?.fontFamily}
                                            onSelect={(weight) =>
                                                updateConfig({
                                                    cover: {
                                                        ...config.cover,
                                                        configuration: {
                                                            ...config.configuration,
                                                            fontWeight: weight,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg">Cover Style</h2>
                                        <FontStylePicker
                                            currentFont={
                                                config.cover.configuration?.fontFamily || 'Roboto'
                                            }
                                            defaultValue={
                                                config.cover.configuration?.fontStyle || 'normal'
                                            }
                                            onSelect={(style) =>
                                                updateConfig({
                                                    cover: {
                                                        ...config.cover,
                                                        configuration: {
                                                            ...config.configuration,
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

                    <Button
                        size={'lg'}
                        onClick={() => {
                            if (!coverLabelInputref.current?.value) return

                            updateConfig({
                                cover: {
                                    ...config.cover,
                                    label: coverLabelInputref.current.value,
                                    ...(coverType === 'text' &&
                                        coverDescriptionRef.current && {
                                            text: coverDescriptionRef.current,
                                        }),
                                },
                            })
                        }}
                    >
                        Save
                    </Button>
                </div>
                {/* end cover options */}
            </div>
            {/* end cover screen */}
            <div className="flex flex-col gap-4 w-full">
                <h3 className="mb-4 text-lg text-center font-medium">Thank You Screen</h3>
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
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">External link Label</h2>
                    <Input
                        ref={successLabelInputref}
                        placeholder="Join Channel"
                        defaultValue={config.success.url}
                        onChange={(e) => {
                            updateConfig({
                                success: { ...config.success, label: e.target.value },
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        htmlFor="success"
                    >
                        {config.success?.image ? 'Update' : 'Upload'} your Thank You screen image
                    </label>

                    <UploadSlide
                        htmlFor="success"
                        setSlide={(image) => {
                            updateConfig({
                                success: { ...config.success, image },
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
                    {config.success?.image ? (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                updateConfig({
                                    sucess: { ...config.success, image: null },
                                })
                            }}
                            className="w-full"
                        >
                            Remove
                        </Button>
                    ) : null}
                </div>
            </div>
        </>
    )
}
