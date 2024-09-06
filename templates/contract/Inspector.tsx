'use client'
import { Button, Input, Label, RadioGroup } from '@/sdk/components'
import { BasicViewInspector, BasicViewStyleConfig } from '@/sdk/components/BasicViewInspector'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { getContractData } from './common/etherscan'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
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
        } catch {
            toast.error('Error fetching contract data')
        }
    }, 100)

    return (
        <Configuration.Root>
            <Configuration.Section
                title="Cover"
                description="Configure what shows up on the cover screen of your Frame."
            >
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
                    <RadioGroup.Root
                        defaultValue={coverType}
                        className="flex flex-row"
                        onValueChange={(val) => {
                            const value = val as 'image' | 'text'
                            setCoverType(value)
                            if (val === 'text' && config.cover.image) {
                                updateConfig({
                                    cover: {
                                        ...config.cover,
                                        image: null,
                                    },
                                })
                            }
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
                <div className="flex flex-col gap-4 w-full">
                    {coverType === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="cover-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.cover.image ? 'Update' : 'Upload'} Cover Image
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
                                                const base64String = (
                                                    reader.result as string
                                                ).split(',')[1]
                                                resolve(base64String)
                                            }
                                        })) as string

                                        const contentType = e.target.files[0].type as
                                            | 'image/png'
                                            | 'image/jpeg'
                                            | 'image/gif'
                                            | 'image/webp'

                                        const { filePath } = await uploadImage({
                                            base64String,
                                            contentType,
                                        })

                                        if (filePath) {
                                            const image = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                            updateConfig({
                                                cover: {
                                                    ...config.cover,
                                                    image,
                                                },
                                            })
                                        }
                                    }
                                }}
                            />
                            {config.cover.image ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                image: null,
                                            },
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
                            <BasicViewInspector
                                name="Cover"
                                title={config.cover.title}
                                subtitle={config.cover.subtitle}
                                bottomMessage={config.cover.bottomMessage}
                                background={config.cover.background}
                                onUpdate={(cover) => {
                                    updateConfig({
                                        cover,
                                    })
                                }}
                            />
                        </div>
                    )}
                </div>
            </Configuration.Section>
            <Configuration.Section
                title="Contract"
                description="Configure the contract slide of your Frame."
            >
                <h2 className="text-2xl text-center">Field styles customizations</h2>
                <BasicViewStyleConfig
                    name="Contract Function name"
                    config={config.functionSlide?.title}
                    updateConfig={(title) => {
                        updateConfig({
                            functionSlide: {
                                ...config.functionSlide,
                                title,
                            },
                        })
                    }}
                    background={config.functionSlide?.background}
                    setBackground={(background) => {
                        updateConfig({
                            functionSlide: {
                                ...config.functionSlide,
                                background,
                            },
                        })
                    }}
                />
                <BasicViewStyleConfig
                    name="Contract Function data/signature"
                    config={config.functionSlide?.subtitle}
                    updateConfig={(subtitle) => {
                        updateConfig({
                            functionSlide: {
                                ...config.functionSlide,
                                subtitle,
                            },
                        })
                    }}
                />
                <BasicViewStyleConfig
                    name="Progress"
                    config={config.functionSlide?.bottomMessage}
                    updateConfig={(bottomMessage) => {
                        updateConfig({
                            functionSlide: {
                                ...config.functionSlide,
                                bottomMessage,
                            },
                        })
                    }}
                />
            </Configuration.Section>
        </Configuration.Root>
    )
}
