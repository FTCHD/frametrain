'use client'
import {
    BasicViewInspector,
    Button,
    ColorPicker,
    Input,
    Label,
    RadioGroup,
    Select,
    Switch,
} from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { getFarcasterProfiles } from '@/sdk/neynar'
import { TrashIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Config } from '.'
import { type ChainKey, getTokenSymbol, supportedChains } from './common/onchain'
import { formatSymbol } from './common/shared'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()

    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 2

    const amountInputRef = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()
    const [coverType, setCoverType] = useState<'text' | 'image'>(
        config.cover.image ? 'image' : 'text'
    )
    const [aboutType, setAboutType] = useState<'text' | 'image'>(
        config.about.image ? 'image' : 'text'
    )
    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        async function setUserAddress() {
            if (config.address) {
                return
            }
            try {
                const users = await getFarcasterProfiles([fid])
                const user = users[0]
                const ethAddresses = user.verified_addresses.eth_addresses

                if (ethAddresses.length === 0) {
                    return
                }

                updateConfig({
                    address: ethAddresses[0],
                })
                toast.success('We set the address to your verified Warpcast address')
            } catch {
                toast.error('We could not set the address to your verified Warpcast address')
            }
        }

        setUserAddress()
    }, [])

    const showTokenFields =
        config.address && config.token?.address && config.token?.chain && config.token?.symbol

    return (
        <Configuration.Root>
            <Configuration.Section
                title="Cover"
                description="Configure what shows up on the cover screen of your Frame."
            >
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
                <div className="flex flex-col gap-2 w-full">
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
            <Configuration.Section
                title="About"
                description="Configure what shows up on the about slide of your Frame."
            >
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">About Slide Type</h2>
                    <RadioGroup.Root
                        defaultValue={aboutType}
                        className="flex flex-row"
                        onValueChange={(val) => {
                            const value = val as 'image' | 'text'
                            setAboutType(value)
                            if (val === 'text' && config.about.image) {
                                updateConfig({
                                    about: {
                                        ...config.about,
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
                <div className="flex flex-col gap-2 w-full">
                    {aboutType === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="cover-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.about.image ? 'Update' : 'Upload'} About Slide Image
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
                                                about: {
                                                    ...config.about,
                                                    image,
                                                },
                                            })
                                        }
                                    }
                                }}
                            />
                            {config.about.image ? (
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
                        <BasicViewInspector
                            name="About Slide"
                            title={config.about.title}
                            subtitle={config.about.subtitle}
                            bottomMessage={config.about.bottomMessage}
                            background={config.about.background}
                            onUpdate={(about) => {
                                updateConfig({
                                    about,
                                })
                            }}
                        />
                    )}
                </div>
            </Configuration.Section>
            <Configuration.Section
                title="Fundraise"
                description="Configure your fundraiser settings."
            >
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Address or ENS name</h2>
                    <div className="flex flex-row gap-2 w-full items-center">
                        <Input
                            defaultValue={config.address}
                            disabled={config.locked}
                            placeholder="0xe.....fb49 or vitalik.eth"
                            onChange={(e) => {
                                const address = e.target.value.trim().toLowerCase()
                                updateConfig({
                                    address: address === '' ? undefined : address,
                                })
                            }}
                        />
                        {config.address ? (
                            <Button
                                className="px-4 py-2 rounded-md"
                                onClick={() => {
                                    if (!config.address) return
                                    updateConfig({ locked: !config.locked })
                                }}
                            >
                                {config.locked ? 'Unlock' : 'Lock'}
                            </Button>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Token Address </h2>
                    <Input
                        defaultValue={config.token?.address}
                        disabled={!config.address}
                        onChange={(e) => {
                            const address = e.target.value.trim().toLowerCase()
                            updateConfig({
                                token: {
                                    ...config.token,
                                    address: address === '' ? undefined : address,
                                },
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">Token & Fundraise Address Chain</h2>
                    <Select
                        defaultValue={config.token?.chain}
                        disabled={!config.token?.address}
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
                        {supportedChains.map((chain) => (
                            <option key={chain.id} value={chain.key}>
                                {chain.label}
                            </option>
                        ))}
                    </Select>
                </div>
                {showTokenFields ? (
                    <div className="flex flex-col gap-4 w-full">
                        <h2 className="text-lg">Amount Raising</h2>
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-row items-center justify-between gap-2 ">
                                <Label className="font-md" htmlFor="predefined-amounts">
                                    Enable predefined amounts?
                                </Label>
                                <Switch
                                    id="predefined-amounts"
                                    checked={config.enablePredefinedAmounts}
                                    onCheckedChange={(enablePredefinedAmounts) => {
                                        updateConfig({
                                            enablePredefinedAmounts,
                                        })
                                    }}
                                />
                            </div>

                            {config.enablePredefinedAmounts ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col w-full gap-2">
                                        <label className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2">
                                            Amount Raising {config.tokenSymbol}
                                        </label>
                                        <div className="flex flex-row w-full items-center gap-2">
                                            <Input
                                                disabled={disableAmountsField}
                                                ref={amountInputRef}
                                                className="text-lg border rounded py-2 px-4 w-full"
                                                type="number"
                                            />
                                            {!disableAmountsField ? (
                                                <Button
                                                    type="button"
                                                    disabled={disableAmountsField}
                                                    className="px-4 py-2 rounded-md"
                                                    onClick={() => {
                                                        if (
                                                            !amountInputRef.current ||
                                                            amounts.length >= 2
                                                        )
                                                            return

                                                        const amount =
                                                            amountInputRef.current.value.trim()

                                                        if (
                                                            isNaN(Number(amount)) ||
                                                            Number(amount) < 0
                                                        ) {
                                                            toast.error('Invalid amount')
                                                            return
                                                        }

                                                        updateConfig({
                                                            amounts: [...amounts, Number(amount)],
                                                        })

                                                        amountInputRef.current.value = ''
                                                    }}
                                                >
                                                    Add amount
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-semibold">
                                            Manage Predefined amounts
                                        </h2>
                                        {!amounts.length ? (
                                            <p className="italic text-gray-300">
                                                No amounts added yet!
                                            </p>
                                        ) : null}
                                        <div className="w-full flex flex-col gap-2">
                                            {amounts.map((amount, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                                                >
                                                    <span>
                                                        {index + 1}.{' '}
                                                        {formatSymbol(
                                                            amount,
                                                            config.token?.symbol!
                                                        )}
                                                    </span>
                                                    <Button
                                                        variant={'destructive'}
                                                        onClick={() =>
                                                            updateConfig({
                                                                fields: [
                                                                    ...config.amounts.slice(
                                                                        0,
                                                                        index
                                                                    ),
                                                                    ...config.amounts.slice(
                                                                        index + 1
                                                                    ),
                                                                ],
                                                            })
                                                        }
                                                    >
                                                        <TrashIcon />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </Configuration.Section>
            <Configuration.Section
                title="ProgressBar"
                description="Configure the progress bar color."
            >
                <h2 className="text-lg font-semibold">Progress bar Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config?.barColor || 'yellow'}
                    setBackground={(barColor) => {
                        updateConfig({
                            barColor,
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
            </Configuration.Section>
            <Configuration.Section
                title="Success"
                description="Configure what shows up after a Donation was successful."
            >
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Success Slide Type</h2>
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
                <div className="flex flex-col gap-2 w-full">
                    {successType === 'image' ? (
                        <div className="flex flex-col gap-2 w-full">
                            <label
                                htmlFor="cover-image"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {config.success.image ? 'Update' : 'Upload'} Success Slide Image
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
                        <BasicViewInspector
                            name="Success Slide"
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
                    )}
                </div>
            </Configuration.Section>
        </Configuration.Root>
    )
}
