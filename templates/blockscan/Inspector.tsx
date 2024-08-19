'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '.'
import { useDebouncedCallback } from 'use-debounce'
import { getContractData } from './utils/etherscan'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { Label } from '@/components/shadcn/Label'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { Slider } from '@/components/shadcn/Slider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.coverImage ? 'image' : 'text'
    )
    const [coverTitleFontSize, setCoverTitleFontSize] = useState(
        config.cover?.titleStyles?.size || 30
    )
    const [coverSubtitleFontSize, setCoverSubtitleFontSize] = useState(
        config.cover?.subtitleStyles?.size || 15
    )
    const uploadImage = useUploadImage()

    const onChangeLink = useDebouncedCallback(async (link: string) => {
        if (config.etherscan?.link === link) return

        if (!link.length) {
            updateConfig({ etherscan: null })
            return
        }

        try {
            //
            const etherscan = await getContractData(link)
            toast.success('Contract data fetched successfully')
            updateConfig({ etherscan })
        } catch (e) {
            const error = e as Error
            toast.error(error.message)
        }
    }, 100)

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex flex-col gap-2 ">
                <div className="flex flex-col gap-2 ">
                    <h2 className="text-lg font-semibold">Contract Url:</h2>
                    <Input
                        className="text-lg"
                        defaultValue={config.etherscan?.link}
                        type="url"
                        placeholder="https://etherscan.io/address/0xa0b8...9cd"
                        onChange={(e) => onChangeLink(e.target.value)}
                    />
                </div>

                {config.etherscan ? (
                    <Button
                        variant="destructive"
                        className="w-full "
                        onClick={() => updateConfig({ etherscan: null })}
                    >
                        Delete
                    </Button>
                ) : null}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Cover Type</h2>
                <RadioGroup
                    defaultValue={coverType}
                    className="flex flex-row"
                    onValueChange={(val) => {
                        const value = val as 'image' | 'text'
                        setCoverType(value as typeof coverType)
                        if (val === 'text' && config.coverImage) updateConfig({ coverImage: null })
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
                            htmlFor="cover-image"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            {config.coverImage ? 'Update' : 'Upload'} Cover Image
                        </label>
                        <Input
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            type="file"
                            id="cover-image"
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    const reader = new FileReader()
                                    reader.readAsDataURL(e.target.files[0])

                                    const base64String = (await new Promise((resolve) => {
                                        reader.onload = () => {
                                            const base64String = (reader.result as string).split(
                                                ','
                                            )[1]
                                            resolve(base64String)
                                        }
                                    })) as string

                                    const contentType = e.target.files[0].type as
                                        | 'image/png'
                                        | 'image/jpeg'
                                        | 'image/gif'
                                        | 'image/webp'

                                    const filePath = await uploadImage({
                                        base64String,
                                        contentType,
                                    })

                                    if (filePath) {
                                        const coverImage = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                        updateConfig({
                                            coverImage,
                                        })
                                    }
                                }
                            }}
                        />
                        {config.coverImage ? (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    updateConfig({
                                        coverImage: null,
                                    })
                                }}
                                className="w-full"
                            >
                                Remove
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-col w-full">
                                <h2 className="text-lg">Cover Title</h2>
                                <Input
                                    className="py-2 text-lg"
                                    defaultValue={config.coverText?.title}
                                    onChange={async (e) => {
                                        const title = e.target.value.trim()
                                        if (title === '') {
                                            toast.error('Please enter a title for the cover')
                                            return
                                        }
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                title,
                                            },
                                        })
                                    }}
                                    placeholder="cover title"
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <h2 className="text-lg">Cover Subtitle</h2>
                                <Input
                                    className="py-2 text-lg"
                                    defaultValue={config.coverText?.subtitle}
                                    onChange={async (e) => {
                                        const subtitle = e.target.value.trim()

                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitle: subtitle === '' ? undefined : subtitle,
                                            },
                                        })
                                    }}
                                    placeholder="cover subtitle"
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <h2 className="text-lg">Cover Custom Message</h2>
                                <Input
                                    className="py-2 text-lg"
                                    defaultValue={config.coverText?.customMessage}
                                    onChange={async (e) => {
                                        const value = e.target.value.trim()
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                customMessage: value === '' ? undefined : value,
                                            },
                                        })
                                    }}
                                    placeholder="your custom message"
                                />
                            </div>
                        </div>

                        {/* Styles config */}
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg text-center">Cover customizations</h2>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Cover background</h2>
                                <ColorPicker
                                    className="w-full"
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    background={config.coverText?.backgroundColor || 'black'}
                                    setBackground={(backgroundColor) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                backgroundColor,
                                            },
                                        })
                                    }}
                                    uploadBackground={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String: base64String,
                                            contentType: contentType,
                                        })

                                        return filePath
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.coverText?.titleStyles?.color || 'white'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    color,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-lg font-semibold">
                                    Title Size ({coverTitleFontSize}px)
                                </label>

                                <Slider
                                    defaultValue={[coverTitleFontSize]}
                                    max={140}
                                    step={2}
                                    onValueChange={(newRange) => {
                                        const size = newRange[0]
                                        setCoverTitleFontSize(size)
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    size,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.coverText?.titleStyles?.font || 'Roboto'}
                                    onSelect={(font) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    font,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Style</h2>
                                <FontStylePicker
                                    currentFont={config.coverText?.titleStyles?.font || 'Roboto'}
                                    defaultValue={config.coverText?.titleStyles?.style || 'normal'}
                                    onSelect={(style: string) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    style,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Weight</h2>
                                <FontWeightPicker
                                    currentFont={config.coverText?.titleStyles?.font || 'Roboto'}
                                    defaultValue={config.coverText?.titleStyles?.weight || 'normal'}
                                    onSelect={(weight) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    weight,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Position</h2>
                                <Select
                                    defaultValue={
                                        config.coverText?.titleStyles?.alignment || 'center'
                                    }
                                    onValueChange={(alignment: 'left' | 'center' | 'right') => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.titleStyles,
                                                    alignment,
                                                },
                                            },
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Left" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={'left'}>Left</SelectItem>
                                        <SelectItem value={'center'}>Center</SelectItem>
                                        <SelectItem value={'right'}>Right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Subtitle Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.coverText?.subtitleStyles?.color || 'white'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    color,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-lg font-semibold">
                                    Subtitle Size ({coverSubtitleFontSize}
                                    px)
                                </label>
                                <Slider
                                    defaultValue={[coverSubtitleFontSize]}
                                    max={140}
                                    step={2}
                                    onValueChange={(newRange) => {
                                        const size = newRange[0]
                                        setCoverSubtitleFontSize(size)
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                titleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    size,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Subtitle Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.coverText?.titleStyles?.font || 'Roboto'}
                                    onSelect={(font) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    font,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Subtitle Style</h2>
                                <FontStylePicker
                                    currentFont={config.coverText?.titleStyles?.font || 'Roboto'}
                                    defaultValue={config.coverText?.titleStyles?.style || 'normal'}
                                    onSelect={(style) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    style,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Subtitle Weight</h2>
                                <FontWeightPicker
                                    currentFont={config.coverText?.titleStyles?.font || 'Roboto'}
                                    defaultValue={config.coverText?.titleStyles?.weight || 'normal'}
                                    onSelect={(weight) => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    weight,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Subtitle Position</h2>{' '}
                                <Select
                                    defaultValue={
                                        config.coverText?.titleStyles?.alignment || 'center'
                                    }
                                    onValueChange={(alignment: 'left' | 'center' | 'right') => {
                                        updateConfig({
                                            coverText: {
                                                ...config.coverText,
                                                subtitleStyles: {
                                                    ...config.coverText?.subtitleStyles,
                                                    alignment,
                                                },
                                            },
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Left" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={'left'}>Left</SelectItem>
                                        <SelectItem value={'center'}>Center</SelectItem>
                                        <SelectItem value={'right'}>Right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Function Customization</h2>
                        <p className="text-sm text-muted-foreground">
                            Customize how your Smart Contract Frame functions are show to your
                            viewers
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
