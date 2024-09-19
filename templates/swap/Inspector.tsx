'use client'
import {
    Avatar,
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    Input,
    Label,
    RadioGroup,
    Slider,
    Switch,
    ToggleGroup,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { TrashIcon } from 'lucide-react'
import type { AnchorHTMLAttributes, FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Config, PoolToken } from '.'
import { formatSymbol, uniswapChains } from './common/format'
import { getPoolData } from './common/uniswap'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const poolAddressInputRef = useRef<HTMLInputElement>(null)
    const amountInputRef = useRef<HTMLInputElement>(null)
    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 3

    const [successType, setSuccessType] = useState<'text' | 'image'>(
        config.success.image ? 'image' : 'text'
    )
    const [pairNameFontSize, setPairNameFontSize] = useState(config.pairName?.fontSize || 50)
    const [coverMessageFontSize, setCoverMessageFontSize] = useState(
        config.coverMessage?.fontSize || 50
    )
    const [coverTitleFontSize, setSuccessTitleFontSize] = useState(
        config.success?.title?.fontSize || 50
    )
    const [successSubtitleFontSize, setSuccessSubtitleFontSize] = useState(
        config.success?.subtitle?.fontSize || 30
    )
    const [successMessageFontSize, setSuccessMessageFontSize] = useState(
        config.success?.bottomMessage?.fontSize || 20
    )

    useEffect(() => {
        if (!poolAddressInputRef.current) return
        if (!config.pool?.address) return

        poolAddressInputRef.current.value = config.pool.address
    }, [config.pool?.address])

    const LinkExternal: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
        target = '_blank',
        rel = 'noopener noreferrer',
        ...props
    }) => {
        return (
            <a
                {...props}
                target={target}
                rel={rel}
                className="cursor-pointer text-blue-500 hover:underline"
            />
        )
    }

    const TokenImage = ({
        token,
        isLast = false,
    }: {
        token: PoolToken
        isLast?: boolean
    }) => {
        return (
            <div
                className="rounded-full inline-flex z-10 border-2 ring-gray-50 dark:ring-slate-950"
                style={{ marginLeft: isLast ? -36 / 3 : 0 }}
            >
                <Avatar.Root style={{ width: 36, height: 36 }}>
                    <Avatar.Image src={token.logo} />
                </Avatar.Root>
            </div>
        )
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="Pool">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Uniswap Pool address</h2>
                    <Input
                        className="py-2 text-lg"
                        defaultValue={config.pool ? `${config.pool.address}` : undefined}
                        onChange={async (e) => {
                            const poolAddress = e.target.value.trim().toLowerCase()

                            if (poolAddress === config.pool?.address) return

                            if (poolAddress === '') {
                                updateConfig({
                                    pool: null,
                                    enablePredefinedAmounts: false,
                                    amounts: [],
                                })
                                return
                            }

                            try {
                                const pool = await getPoolData(poolAddress as `0x${string}`)

                                updateConfig({
                                    pool: {
                                        address: poolAddress,
                                        network: pool.network,
                                        token0: pool.token0,
                                        token1: pool.token1,
                                        primary: 'token0',
                                    },
                                    enablePredefinedAmounts: false,
                                    amounts: [],
                                })

                                toast.success(`Pool found on ${pool.chain}`)
                            } catch {
                                toast.error('Pool not found on any supported chain')
                            }
                        }}
                    />

                    <p className="text-sm text-muted-foreground">
                        Only the following networks are supported:{' '}
                        {uniswapChains.map((c) => c.label).join(', ')}
                    </p>
                </div>
            </Configuration.Section>
            <Configuration.Section title="Tokens and amounts">
                {config.pool ? (
                    <>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold">
                                Tokens on ({config.pool.network.name})
                            </h2>

                            <div className="relative flex items-center gap-3 max-w-[100vh]">
                                <LinkExternal
                                    href={`${config.pool.network.explorerUrl}/address/${config.pool.address}`}
                                >
                                    <div className="flex items-center">
                                        <div className="inline-flex">
                                            <TokenImage token={config.pool.token0} />
                                            <TokenImage token={config.pool.token1} isLast={true} />
                                        </div>
                                    </div>
                                </LinkExternal>
                                <ToggleGroup.Root
                                    type="single"
                                    className="flex justify-start gap-2"
                                    defaultValue={config.pool.primary}
                                >
                                    <ToggleGroup.Item
                                        value="token0"
                                        disabled={config.pool.primary === 'token0'}
                                        className="border-2 border-zinc-600"
                                        onClick={() => {
                                            updateConfig({
                                                pool: {
                                                    ...config.pool,
                                                    primary: 'token0',
                                                },
                                            })
                                        }}
                                    >
                                        {config.pool.token0.symbol}
                                    </ToggleGroup.Item>
                                    <ToggleGroup.Item
                                        value="token1"
                                        disabled={config.pool.primary === 'token1'}
                                        className="border-2 border-zinc-600"
                                        onClick={() => {
                                            updateConfig({
                                                pool: {
                                                    ...config.pool,
                                                    primary: 'token1',
                                                },
                                            })
                                        }}
                                    >
                                        {config.pool.token1.symbol}
                                    </ToggleGroup.Item>
                                </ToggleGroup.Root>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The choosen token will be used as the primary token for the swap
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center justify-between gap-2 ">
                                    <Label className="font-md" htmlFor="qna-customization">
                                        Enable predefined amounts
                                    </Label>
                                    <Switch
                                        id="qna-customization"
                                        checked={config.enablePredefinedAmounts}
                                        onCheckedChange={(checked) => {
                                            const enablePredefinedAmounts = checked
                                            updateConfig({
                                                enablePredefinedAmounts,
                                                ...(!enablePredefinedAmounts ? { amount: [] } : {}),
                                            })
                                        }}
                                    />
                                </div>
                            </div>

                            {config.enablePredefinedAmounts ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col w-full gap-2">
                                        <label className="block uppercase tracking-wide text-gray-200 text-xs font-bold mb-2">
                                            Buying Amount in{' '}
                                            {config.pool.primary === 'token0'
                                                ? config.pool.token1.symbol
                                                : config.pool.token0.symbol}
                                        </label>
                                        <div className="flex flex-row w-full items-center gap-2">
                                            <Input
                                                disabled={disableAmountsField}
                                                ref={amountInputRef}
                                                className="text-lg border rounded py-2 px-4 w-full"
                                                type="number"
                                            />
                                            <Button
                                                type="button"
                                                disabled={disableAmountsField}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                                onClick={() => {
                                                    if (!amountInputRef.current) return
                                                    if (config.amounts.length > 3) return

                                                    const amount =
                                                        amountInputRef.current.value.trim()

                                                    if (amount === '') return

                                                    updateConfig({
                                                        amounts: [...config.amounts, amount],
                                                    })

                                                    amountInputRef.current.value = ''
                                                }}
                                            >
                                                Add amount
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-semibold">
                                            Manage Predefined amounts
                                        </h2>
                                        {!amounts.length ? (
                                            <p className="italic text-gray-300">
                                                No Input Field Added yet!
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
                                                            config.pool!.primary === 'token0'
                                                                ? config.pool!.token1.symbol
                                                                : config.pool!.token0.symbol
                                                        )}
                                                    </span>
                                                    <Button
                                                        variant={'destructive'}
                                                        onClick={() =>
                                                            updateConfig({
                                                                amounts: [
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
                    </>
                ) : (
                    <h1>Pool address required</h1>
                )}
            </Configuration.Section>
            <Configuration.Section title="Cover">
                {config.pool ? (
                    <>
                        <div className="flex flex-col w-full">
                            <h2 className="text-lg">Cover Custom Message</h2>
                            <Input
                                className="py-2 text-lg"
                                defaultValue={config.coverMessage?.text}
                                onChange={async (e) => {
                                    const value = e.target.value.trim()
                                    updateConfig({
                                        coverMessage: {
                                            ...config.coverMessage,
                                            text: value === '' ? undefined : value,
                                        },
                                    })
                                }}
                                placeholder="your custom message"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg text-center">Cover Slide customizations</h2>

                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Cover background</h2>
                                <ColorPicker
                                    className="w-full"
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    background={config.background || 'black'}
                                    setBackground={(background) => {
                                        updateConfig({
                                            background,
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
                                <h2 className="text-lg font-semibold">Pair name Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.pairName?.color || 'white'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            pairName: {
                                                ...config.pairName,
                                                color,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-lg font-semibold">
                                    Pair name Size ({pairNameFontSize}px)
                                </label>

                                <Slider
                                    defaultValue={[pairNameFontSize]}
                                    max={140}
                                    step={2}
                                    onValueChange={(newRange) => {
                                        const fontSize = newRange[0]
                                        setPairNameFontSize(fontSize)
                                        updateConfig({
                                            pairName: {
                                                ...config.pairName,
                                                fontSize,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Pair name Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.pairName?.fontFamily || 'Roboto'}
                                    onSelect={(fontFamily) => {
                                        updateConfig({
                                            pairName: {
                                                ...config.pairName,
                                                fontFamily,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Pair name Style</h2>
                                <FontStylePicker
                                    currentFont={config.pairName?.fontFamily || 'Roboto'}
                                    defaultValue={config.pairName?.fontStyle || 'normal'}
                                    onSelect={(fontStyle) => {
                                        updateConfig({
                                            pairName: {
                                                ...config.pairName,
                                                fontStyle,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Pair name Weight</h2>
                                <FontWeightPicker
                                    currentFont={config.pairName?.fontFamily || 'Roboto'}
                                    defaultValue={config.pairName?.fontWeight || 'normal'}
                                    onSelect={(fontWeight) => {
                                        updateConfig({
                                            pairName: {
                                                ...config.pairName,
                                                fontWeight,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">
                                    Cover custom message Color
                                </h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.coverMessage?.color || 'white'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            coverMessage: {
                                                ...config.coverMessage,
                                                color,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-lg font-semibold">
                                    Cover custom message Size ({coverMessageFontSize}px)
                                </label>

                                <Slider
                                    defaultValue={[coverMessageFontSize]}
                                    max={140}
                                    step={2}
                                    onValueChange={(newRange) => {
                                        const fontSize = newRange[0]
                                        setCoverMessageFontSize(fontSize)
                                        updateConfig({
                                            coverMessage: {
                                                ...config.coverMessage,
                                                fontSize,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Cover custom message Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.coverMessage?.fontFamily || 'Roboto'}
                                    onSelect={(fontFamily) => {
                                        updateConfig({
                                            coverMessage: {
                                                ...config.coverMessage,
                                                fontFamily,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">
                                    Cover custom message Style
                                </h2>
                                <FontStylePicker
                                    currentFont={config.coverMessage?.fontFamily || 'Roboto'}
                                    defaultValue={config.coverMessage?.fontStyle || 'normal'}
                                    onSelect={(fontStyle) => {
                                        updateConfig({
                                            coverMessage: {
                                                ...config.coverMessage,
                                                fontStyle,
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">
                                    Cover custom message Weight
                                </h2>
                                <FontWeightPicker
                                    currentFont={config.coverMessage?.fontFamily || 'Roboto'}
                                    defaultValue={config.coverMessage?.fontWeight || 'normal'}
                                    onSelect={(fontWeight) => {
                                        updateConfig({
                                            coverMessage: {
                                                ...config.coverMessage,
                                                fontWeight,
                                            },
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <h1>Pool address required</h1>
                )}
            </Configuration.Section>
            <Configuration.Section title="Success Slide Type">
                {config.pool ? (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold">Success Slide Type</h2>
                            <RadioGroup.Root
                                defaultValue={successType}
                                className="flex flex-row"
                                onValueChange={(val) => {
                                    const value = val as 'image' | 'text'
                                    setSuccessType(value as typeof successType)
                                    if (val === 'text' && config.success.image)
                                        updateConfig({
                                            success: {
                                                ...config.success,
                                                image: null,
                                            },
                                        })
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

                                                const base64String = (await new Promise(
                                                    (resolve) => {
                                                        reader.onload = () => {
                                                            const base64String = (
                                                                reader.result as string
                                                            ).split(',')[1]
                                                            resolve(base64String)
                                                        }
                                                    }
                                                )) as string

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
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            image: `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`,
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
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Success Title</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.success?.title.text}
                                                onChange={async (e) => {
                                                    const title = e.target.value.trim()
                                                    if (title === '') {
                                                        toast.error(
                                                            'Please enter a title for the cover'
                                                        )
                                                        return
                                                    }
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
                                                                text: title,
                                                            },
                                                        },
                                                    })
                                                }}
                                                placeholder="cover title"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Success Subtitle</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.success?.subtitle.text}
                                                onChange={async (e) => {
                                                    const subtitle = e.target.value.trim()

                                                    if (subtitle === '') {
                                                        toast.error(
                                                            'Please enter a subtitle for the success slide'
                                                        )
                                                        return
                                                    }

                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                text: subtitle,
                                                            },
                                                        },
                                                    })
                                                }}
                                                placeholder="cover subtitle"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg">Success Custom Message</h2>
                                            <Input
                                                className="py-2 text-lg"
                                                defaultValue={config.success?.bottomMessage?.text}
                                                onChange={async (e) => {
                                                    const value = e.target.value.trim()
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            bottomMessage: {
                                                                ...config.success?.bottomMessage,
                                                                text:
                                                                    value === ''
                                                                        ? undefined
                                                                        : value,
                                                            },
                                                        },
                                                    })
                                                }}
                                                placeholder="your custom message"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <h2 className="text-lg text-center">
                                            Success Slide customizations
                                        </h2>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Success background
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                enabledPickers={['solid', 'gradient', 'image']}
                                                background={config.success?.background || 'black'}
                                                setBackground={(background) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            background,
                                                        },
                                                    })
                                                }}
                                                uploadBackground={async (
                                                    base64String,
                                                    contentType
                                                ) => {
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
                                                background={config.success?.title?.color || 'white'}
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
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
                                                    const fontSize = newRange[0]
                                                    setSuccessTitleFontSize(fontSize)
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
                                                                fontSize,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.success?.title?.fontFamily || 'Roboto'
                                                }
                                                onSelect={(fontFamily) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
                                                                fontFamily,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Style</h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.success?.title?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.title?.fontStyle || 'normal'
                                                }
                                                onSelect={(fontStyle) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
                                                                fontStyle,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Title Weight</h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.success?.title?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.title?.fontWeight || 'normal'
                                                }
                                                onSelect={(fontWeight) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.title,
                                                                fontWeight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.success?.subtitle?.color || 'white'
                                                }
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                color,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="text-lg font-semibold">
                                                Subtitle Size ({successSubtitleFontSize}px)
                                            </label>

                                            <Slider
                                                defaultValue={[successSubtitleFontSize]}
                                                max={140}
                                                step={2}
                                                onValueChange={(newRange) => {
                                                    const fontSize = newRange[0]
                                                    setSuccessSubtitleFontSize(fontSize)
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                fontSize,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">Subtitle Font</h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.success?.subtitle?.fontFamily || 'Roboto'
                                                }
                                                onSelect={(fontFamily) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                fontFamily,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Style
                                            </h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.success?.subtitle?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.subtitle?.fontStyle || 'normal'
                                                }
                                                onSelect={(fontStyle) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                fontStyle,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Subtitle Weight
                                            </h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.success?.subtitle?.fontFamily || 'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.subtitle?.fontWeight || 'normal'
                                                }
                                                onSelect={(fontWeight) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.subtitle,
                                                                fontWeight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Color
                                            </h2>
                                            <ColorPicker
                                                className="w-full"
                                                background={
                                                    config.success?.bottomMessage?.color || 'white'
                                                }
                                                setBackground={(color) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            bottomMessage: {
                                                                ...config.success?.bottomMessage,
                                                                color,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="text-lg font-semibold">
                                                Custom Message Size ({successMessageFontSize}px)
                                            </label>

                                            <Slider
                                                defaultValue={[successMessageFontSize]}
                                                max={140}
                                                step={2}
                                                onValueChange={(newRange) => {
                                                    const fontSize = newRange[0]
                                                    setSuccessMessageFontSize(fontSize)
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            bottomMessage: {
                                                                ...config.success?.bottomMessage,
                                                                fontSize,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Font
                                            </h2>
                                            <FontFamilyPicker
                                                defaultValue={
                                                    config.success?.bottomMessage?.fontFamily ||
                                                    'Roboto'
                                                }
                                                onSelect={(fontFamily) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            subtitle: {
                                                                ...config.success?.bottomMessage,
                                                                fontFamily,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Style
                                            </h2>
                                            <FontStylePicker
                                                currentFont={
                                                    config.success?.bottomMessage?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.bottomMessage?.fontStyle ||
                                                    'normal'
                                                }
                                                onSelect={(fontStyle) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            bottomMessage: {
                                                                ...config.success?.bottomMessage,
                                                                fontStyle,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <h2 className="text-lg font-semibold">
                                                Custom Message Weight
                                            </h2>
                                            <FontWeightPicker
                                                currentFont={
                                                    config.success?.bottomMessage?.fontFamily ||
                                                    'Roboto'
                                                }
                                                defaultValue={
                                                    config.success?.bottomMessage?.fontWeight ||
                                                    'normal'
                                                }
                                                onSelect={(fontWeight) => {
                                                    updateConfig({
                                                        success: {
                                                            ...config.success,
                                                            title: {
                                                                ...config.success?.bottomMessage,
                                                                fontWeight,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <h1>Pool address required</h1>
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}
