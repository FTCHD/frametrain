'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/Label'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { getContractData } from './common/etherscan'
import TextSlideEditor, { TextSlideStyleConfig } from '@/sdk/components/TextSlideEditor'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.coverImage ? 'image' : 'text'
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
                        <TextSlideEditor
                            name="Cover"
                            title={{
                                text: 'Cover Title',
                                ...config.coverText?.title,
                            }}
                            subtitle={{
                                text: 'Cover Subtitle',
                                ...config.coverText?.subtitle,
                            }}
                            bottomMessage={{
                                text: 'Cover Custom Message',
                                ...config.coverText?.bottomMessage,
                            }}
                            onUpdate={(updated) => {
                                updateConfig({
                                    coverText: updated.title,
                                })
                            }}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Function Slide Customization</h2>
                        <p className="text-sm text-muted-foreground">
                            Customize how your Smart Contract Frame functions are show to your
                            viewers
                        </p>
                    </div>
                    {/* Function Slide */}
                    <TextSlideStyleConfig
                        name={'Function name'}
                        config={config.functionSlide?.title}
                        background={config.functionSlide?.background}
                        setBackground={(background) =>
                            updateConfig({ functionSlide: { ...config.functionSlide, background } })
                        }
                        updateConfig={(updatedStyle) => {
                            //
                            updateConfig({
                                functionStyles: {
                                    ...config.functionSlide,
                                    title: {
                                        ...config.functionSlide?.title,
                                        ...updatedStyle,
                                    },
                                },
                            })
                        }}
                    />
                    <TextSlideStyleConfig
                        name={'Function information'}
                        config={config.functionSlide?.subtitle}
                        updateConfig={(updatedStyle) => {
                            //
                            updateConfig({
                                functionStyles: {
                                    ...config.functionSlide,
                                    subtitle: {
                                        ...config.functionSlide?.subtitle,
                                        ...updatedStyle,
                                    },
                                },
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
