'use client'
import {
    BasicViewInspector,
    Button,
    GatingInspector,
    Input,
    Label,
    RadioGroup,
    Switch,
} from '@/sdk/components'
import { BasicViewStyleConfig } from '@/sdk/components/BasicViewInspector'
import { useFarcasterId, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebounceCallback } from 'usehooks-ts'
import type { Config } from '.'
import { fetchAmazonProductData, fetchAmazonWishlistData } from './utils'
import { TrashIcon } from 'lucide-react'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const uploadImage = useUploadImage()

    const enabledGating = config.enableGating ?? false

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )
    const productUrlInputRef = useRef<HTMLInputElement>(null)

    const handleWishlistUrl = useDebounceCallback(async () => {
        if (!productUrlInputRef.current?.value) return
        const url = productUrlInputRef.current.value.trim()

        if (url.includes('/wishlist/')) {
            const wishlistProducts = await fetchAmazonWishlistData(url)
            const products = wishlistProducts.filter(
                (d) => !config.products.find((p) => p.url === d.url)
            )
            if (products.length) {
                updateConfig({ products: [...config.products, ...products] })
                toast.success(`Added ${products.length} products from wishlist`)
            }
        } else {
            const product = await fetchAmazonProductData(url)
            if (product && !config.products.find((p) => p.url === product.url)) {
                updateConfig({ products: [...config.products, product] })
                toast.success('Added product')
            }
        }

        productUrlInputRef.current.value = ''
    }, 1000)

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
                <p>{JSON.stringify(config)}</p>
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

            <Configuration.Section title="Wishlist">
                {/* <h3 className="text-lg font-semibold">Product/Wishlist Url</h3> */}
                <p className="text-sm text-muted-foreground">
                    You can use an Amazon product url or a wishlist url
                </p>
                <div className="flex flex-col gap-2 ">
                    <Label htmlFor="address" className="text-sm font-medium leading-none w-full">
                        Product/Wishlist Url
                    </Label>
                    <Input
                        className="text-lg"
                        placeholder="Input something"
                        ref={productUrlInputRef}
                    />
                    <Button
                        onClick={handleWishlistUrl}
                        className="w-full bg-border hover:bg-secondary-border text-primary"
                    >
                        Add Product
                    </Button>
                </div>

                {/* <Button
                    variant="destructive"
                    className="w-full "
                    onClick={() => updateConfig({ text: '' })}
                >
                    Delete
                </Button> */}
            </Configuration.Section>
            {config.products.map((product) => {
                const updateProduct = (
                    url: string,
                    values: Partial<Config['products'][number]['styles']>
                ) => {
                    updateConfig({
                        products: config.products.map((p) => {
                            if (p.url === url) {
                                return { ...p, styles: { ...p.styles, ...values } }
                            }
                            return p
                        }),
                    })
                }
                return (
                    <Configuration.Section title={product.title} key={product.url}>
                        <div className="flex flex-row w-full justify-between">
                            {/* <h2 className="text-lg font-semibold">{product.title}</h2> */}
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    updateConfig({
                                        products: config.products.filter(
                                            (p) => p.url !== product.url
                                        ),
                                    })
                                }
                            >
                                <TrashIcon />
                            </Button>
                        </div>
                        <BasicViewStyleConfig
                            name="Product title"
                            config={product.styles?.title}
                            updateConfig={(title) => {
                                updateProduct(product.url, {
                                    title,
                                })
                            }}
                            background={product.styles?.background}
                            setBackground={(background) => {
                                updateProduct(product.url, {
                                    background,
                                })
                            }}
                        />
                        <BasicViewStyleConfig
                            name="Product details"
                            config={product.styles?.info}
                            updateConfig={(info) => {
                                updateProduct(product.url, {
                                    info,
                                })
                            }}
                        />
                    </Configuration.Section>
                )
            })}

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
