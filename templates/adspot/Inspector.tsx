'use client'
import { BasicViewInspector, Button, Input, Label, RadioGroup, Select } from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { type ChainKey, supportedChains } from '@/sdk/viem'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { getAddressFromEns, getTokenSymbol } from './utils'
import { isAddress } from 'viem'

const chains = supportedChains.filter((chain) => !['blast', 'bsc', 'zora'].includes(chain.key))

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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!config.fid) {
            updateConfig({
                fid: Number(fid),
            })
        }
    }, [config.fid])

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover" description="Configure your cover slide.">
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
            <Configuration.Section title="AdSpace & Payout">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold text-center">Ad Space</h2>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">
                            Token Address{config.token?.symbol ? `=(${config.token?.symbol})` : ''}
                        </h2>
                        <Input
                            defaultValue={config.token?.address}
                            onChange={(e) => {
                                const address = e.target.value.trim().toLowerCase()
                                if (address !== '' && !isAddress(address)) {
                                    toast.error('Invalid token address')
                                    return
                                }
                                updateConfig({
                                    token: {
                                        ...config.token,
                                        address: address === '' ? null : address,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Token chain</h2>
                        <Select
                            defaultValue={config.token?.chain}
                            disabled={!config.token?.address}
                            placeholder="Select a chain"
                            onChange={async (value) => {
                                const chain = value as ChainKey
                                if (!config.token?.address) return
                                try {
                                    const symbol = await getTokenSymbol(config.token.address, chain)
                                    updateConfig({
                                        token: {
                                            ...config.token,
                                            chain,
                                            symbol,
                                        },
                                    })
                                } catch {
                                    toast.error(`Could not fetch token info on ${chain}`)
                                }
                            }}
                        >
                            {chains.map((chain) => (
                                <option key={chain.id} value={chain.key}>
                                    {chain.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Minimum bid</h2>
                        <Input
                            defaultValue={config.minBid}
                            disabled={!config.token}
                            type="number"
                            onChange={(e) => {
                                const minBid = Number(e.target.value.trim().toLowerCase())
                                if (minBid < 1) {
                                    toast.error('Minimum bid must greater than zero(0)')
                                    return
                                }
                                updateConfig({
                                    minBid,
                                })
                            }}
                            placeholder="0.003"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Bid Mode</h2>
                        <p className="text-sm text-muted-foreground max-md:text-xs">
                            There are two modes available: <b>Auction</b> and <b>Continuous</b>.
                            <br />
                            <li>
                                In <b>Auction</b> mode, Viewers will be allowed to bid on the
                                adspace until the dealine set below expires. The highest bid be
                                displayed for all to see and you will be approve one or more bids as
                                winning bids at the end.
                            </li>
                            <li>
                                In <b>Continuous</b> mode, only one highest bid at a time allowed
                                and their ad will be displayed for the entire duration, in hours,
                                you set below after which other Viewers will be allowed to bid.
                            </li>
                        </p>
                        <Select
                            value={config.mode}
                            disabled={!config.token}
                            placeholder="Select a bid mode"
                            onChange={(mode) => updateConfig({ mode, deadline: null })}
                        >
                            <option value="auction">Auction</option>
                            <option value="continuous">Continuous</option>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">
                            Deadline({config.mode === 'auction' ? 'Date time' : 'hours'})
                        </h2>
                        <Input
                            defaultValue={
                                config.mode === 'auction'
                                    ? config.deadline
                                    : Number.parseInt(config.deadline)
                            }
                            disabled={!config.token?.address}
                            type={config.mode === 'auction' ? 'datetime-local' : 'number'}
                            min={config.mode === 'continuous' ? 1 : undefined}
                            onChange={(e) => {
                                const deadline = e.target.value.trim().toLowerCase()
                                if (config.mode === 'continuous' && isNaN(Number(deadline))) {
                                    toast.error('Deadline must be a number')
                                    return
                                }
                                updateConfig({
                                    deadline: config.mode === 'auction' ? deadline : `${deadline}h`,
                                })
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Payout address or ENS name</h2>
                    <div className="flex flex-row gap-2 w-full items-center">
                        <Input
                            defaultValue={config.address}
                            disabled={config.locked}
                            placeholder="0xe.....fb49 or vitalik.eth"
                            onChange={async (e) => {
                                let address = e.target.value.trim().toLowerCase()

                                if (address.endsWith('.eth')) {
                                    try {
                                        address = await getAddressFromEns(address)
                                    } catch (e) {
                                        const error = e as Error
                                        toast.error(error.message)
                                        return
                                    }
                                }

                                updateConfig({
                                    address: address === '' ? undefined : address,
                                })
                            }}
                        />
                    </div>
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
        </Configuration.Root>
    )
}
