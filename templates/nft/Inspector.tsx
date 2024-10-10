'use client'
import {
    BasicViewInspector,
    Button,
    GatingInspector,
    Input,
    Label,
    RadioGroup,
} from '@/sdk/components'
import { useFarcasterId, useFarcasterName, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { corsFetch } from '@/sdk/scrape'
import type { paths } from '@reservoir0x/reservoir-sdk'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Config } from '.'

async function fetchNftMetadata(address: string, tokenId: string) {
    const res = await corsFetch(
        `https://api.reservoir.tools/tokens/v7?tokens=${address}:${tokenId}`
    )
    if (!res) throw Error('Failed to fetch NFT Metadata')
    const data = JSON.parse(
        res
    ) as paths['/tokens/v7']['get']['responses']['200']['schema']['tokens']
    console.log({ data })
    if (!data?.length) throw Error('Invalid NFT Metadata')

    return data[0]
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const uploadImage = useUploadImage()

    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )
    const fid = useFarcasterId()
    const fname = useFarcasterName()

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!config.owner) {
            updateConfig({
                owner: { fid: Number(fid), fname },
            })
        }
    }, [config.owner])

    const contractAddressInputRef = useRef<HTMLInputElement>(null)
    const contractTokenIdlInputRef = useRef<HTMLInputElement>(null)

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover" description="Configure your cover slide.">
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
            <Configuration.Section title="General">
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-sm text-muted-foreground max-md:text-xs">
                        Please make sure you have already created an order on any marketplace where
                        this NFT is listed before you proceed.
                    </p>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="address">NFT contract address</Label>
                        <Input
                            name="address"
                            className="text-lg"
                            placeholder="0x9u89........."
                            ref={contractAddressInputRef}
                        />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="tokenId">NFT Token ID</Label>
                        <Input
                            type="number"
                            name="tokenId"
                            className="text-lg"
                            placeholder="1"
                            ref={contractTokenIdlInputRef}
                        />
                    </div>
                    <Button
                        onClick={async () => {
                            console.log({
                                contractAddressInputRef: contractAddressInputRef.current?.value,
                                contractTokenIdlInputRef: contractTokenIdlInputRef.current?.value,
                            })
                            if (
                                !(
                                    contractAddressInputRef.current?.value &&
                                    contractTokenIdlInputRef.current?.value
                                )
                            ) {
                                toast.error('Please input contract address and token id')
                                return
                            }

                            const address = contractAddressInputRef.current.value.trim()
                            const tokenId = contractTokenIdlInputRef.current.value.trim()
                            const existingNft = config.nfts.find(
                                (nft) =>
                                    nft.token.contract === address && nft.token.tokenId === tokenId
                            )

                            if (existingNft) {
                                toast.error('NFT already exists')
                                return
                            }

                            try {
                                const nft = await fetchNftMetadata(address, tokenId)
                                updateConfig({ nfts: [...config.nfts, nft] })
                                toast.success('NFT added successfully')
                            } catch (e) {
                                const error = e as Error
                                toast.error(error.message)
                            }

                            contractTokenIdlInputRef.current.value = ''
                            contractAddressInputRef.current.value = ''
                        }}
                        className="w-full bg-border hover:bg-secondary-border text-primary"
                    >
                        Add NFT
                    </Button>
                </div>
            </Configuration.Section>
            <Configuration.Section
                title="Success"
                description="Configure the slide that shows after a successful bid."
            >
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Slide Type</h2>
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
                                htmlFor="cover-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.success.image ? 'Update' : 'Upload'} Success Image
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
                                                success: {
                                                    ...config.success,
                                                    image,
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
            <Configuration.Section title="Gating" description="Configure gating settings.">
                <h2 className="text-lg font-semibold">Requirements</h2>
                <GatingInspector
                    config={config.gating}
                    fid={fid}
                    onUpdate={(newGating) => {
                        updateConfig({
                            gating: {
                                ...config.gating,
                                ...newGating,
                            },
                        })
                    }}
                />
            </Configuration.Section>
        </Configuration.Root>
    )
}
