'use client'
import { BaseInput } from '@/components/shadcn/BaseInput'
import {
    BasicViewInspector,
    Button,
    GatingInspector,
    Input,
    Label,
    RadioGroup,
    Switch,
} from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { corsFetch } from '@/sdk/scrape'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { isAddress } from 'viem'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const fid = useFarcasterId()

    const enabledGating = config.enableGating ?? false

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )

    const onChangeSlicerId = useDebouncedCallback(async (value: string) => {
        if (value === '' || Number(value) === config.storeInfo?.id) {
            return
        }

        try {
            const slicerId = Number(value)
            if (Number.isNaN(slicerId)) {
                toast.error('Invalid ID')
                return
            }

            const response = await corsFetch(
                `https://slice.so/api/slicer/${slicerId}/products?fromSlicer=true`
            )

            if (!response) {
                toast.error('Invalid store slice ID')
                return
            }

            const store = JSON.parse(response) as {
                data: {
                    id: number
                    address: string
                    name: string
                    image: string | undefined
                    products: [
                        {
                            id: number
                            productId: number
                            name: string
                            shortDescription: string
                            description: string
                            images: string[]
                            isDelivery: boolean
                            externalProducts: [
                                {
                                    id: number
                                    providerVariantName: string | null
                                    providerVariants: [
                                        {
                                            id: number
                                            variant: string
                                        },
                                    ]
                                },
                            ]
                        },
                    ]
                }
            }

            updateConfig({
                storeInfo: {
                    ...config.storeInfo,
                    id: store.data.id,
                    name: store.data.name,
                    image: store.data.image || 'https://slice.so/slicer_default.png',
                    products: store.data.products.map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        shortDescription: p.shortDescription,
                        image: p.images.length
                            ? p.images[0]
                            : 'https://slice.so/slicer_default.png',
                        variantType: p.externalProducts[0].providerVariantName,
                        variants: p.externalProducts[0].providerVariants,
                    })),
                },
            })
            toast.success('Store data updated')
        } catch (e) {
            const error = e as Error
            toast.error(error.message)
        }
    }, 1000)

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
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
                                            const coverImage = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                            updateConfig({
                                                cover: {
                                                    ...config.cover,
                                                    image: coverImage,
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
            <Configuration.Section title="Store">
                <p className="text-sm text-muted-foreground">
                    You need to own a store on{' '}
                    <a
                        href="https://slice.so"
                        className="text-blue-500"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Slice.so
                    </a>{' '}
                    with products before you can continue
                </p>
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="tokenId" className="text-sm font-medium leading-none w-20">
                        Store address
                    </Label>
                    <BaseInput
                        id="address"
                        type="text"
                        placeholder="0x8....."
                        defaultValue={config.store?.storeAddress}
                        onChange={(e) => {
                            const storeAddress = e.target.value
                            if (storeAddress === '') {
                                updateConfig({ store: null })
                                return
                            }
                            if (!isAddress(storeAddress)) {
                                toast.error('Invalid store address')
                                return
                            }
                            updateConfig({ storeAddress, storeInfo: null })
                        }}
                    />
                </div>
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="address" className="text-sm font-medium leading-none w-20">
                        Store Slice ID
                    </Label>
                    <BaseInput
                        id="slicerId"
                        type="number"
                        placeholder="1"
                        defaultValue={config.store?.id}
                        disabled={!config.storeAddress}
                        onChange={(e) => {
                            onChangeSlicerId(e.target.value)
                        }}
                    />
                </div>
            </Configuration.Section>
            <Configuration.Section title="Product">
                <p>{JSON.stringify(config)}</p>
                <h2 className="text-lg font-semibold">Starter Template</h2>

                <h3 className="text-lg font-semibold">Text</h3>

                <div className="flex flex-col gap-2 ">
                    <Input className="text-lg" placeholder="Input something" />
                </div>
            </Configuration.Section>
            <Configuration.Section title="Success">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Success Type</h2>
                    <RadioGroup.Root
                        defaultValue={successType}
                        className="flex flex-row"
                        onValueChange={(val) => {
                            const value = val as 'image' | 'text'
                            setSuccessType(value)
                            if (val === 'text' && config.success.image) {
                                updateConfig({
                                    success: {
                                        ...config.success,
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
                    {successType === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="success-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.success.image ? 'Update' : 'Upload'} Success Image
                            </label>
                            <Input
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                type="file"
                                id="success-image"
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
                                            const successImage = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                            updateConfig({
                                                success: {
                                                    ...config.success,
                                                    image: successImage,
                                                },
                                            })
                                        }
                                    }
                                }}
                            />
                            {config.success.image ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        updateConfig({
                                            success: {
                                                ...config.success,
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
                                name="Success"
                                title={config.success.title}
                                subtitle={config.success.subtitle}
                                bottomMessage={config.success.bottomMessage}
                                background={config.success.background}
                                onUpdate={(success) => {
                                    updateConfig({
                                        success,
                                    })
                                }}
                            />
                        </div>
                    )}
                </div>
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <div className="flex flex-row items-center justify-between gap-2 ">
                    <Label className="font-md" htmlFor="gating">
                        Enable Gating?
                    </Label>
                    <Switch
                        id="gating"
                        checked={enabledGating}
                        onCheckedChange={(enableGating) => {
                            updateConfig({ enableGating })
                        }}
                    />
                </div>

                {enabledGating && (
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Gating options</h2>
                        <GatingInspector
                            fid={fid}
                            config={config.gating}
                            onUpdate={(option) => {
                                updateConfig({
                                    gating: {
                                        ...config.gating,
                                        ...option,
                                    },
                                })
                            }}
                        />
                    </div>
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}
