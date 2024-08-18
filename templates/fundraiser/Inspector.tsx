'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/RadioGroup'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Separator } from '@/components/shadcn/Separator'
import { Slider } from '@/components/shadcn/Slider'
import { Switch } from '@/components/shadcn/Switch'
import { Textarea } from '@/components/shadcn/Textarea'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Trash } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Config } from '.'
import { type ChainKey, getTokenSymbol, supportedChains } from './common/onchain'
import { formatSymbol } from './common/shared'
type MenuItem = {
    title: string
    description: string
    key: 'cover' | 'fundraise' | 'success'
}

type NavBarItem = MenuItem & {
    active: boolean
}

function sidebarNavItems(obj: { tab: NavBarItem['key'] }): NavBarItem[]
function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne: true
}): MenuItem
function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne?: true
}): MenuItem | NavBarItem[] {
    const items: MenuItem[] = [
        {
            title: 'Fundraise',
            key: 'fundraise',
            description: 'Configure your fundraiser settings.',
        },
        {
            title: 'Cover Screen',
            key: 'cover',
            description: 'Configure what shows up on the cover screen of your Frame.',
        },
        {
            title: 'Success Screen',
            key: 'success',
            description: 'Configure what shows up after a Donation was successful.',
        },
    ]

    if (obj.showOne) {
        const item = items.filter((item) => item.key === obj.tab)[0]
        return item
    }

    const menu: NavBarItem[] = items.map((item) => ({
        ...item,
        active: item.key === obj.tab,
    }))

    return menu
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('fundraise')

    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 3
    const tab = sidebarNavItems({ tab: activeTab, showOne: true })
    const tabs = sidebarNavItems({ tab: activeTab })

    const amountInputRef = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()
    const [coverTitleFontSize, setCoverTitleFontSize] = useState(
        config.cover?.titleStyles?.size || 20
    )
    const [coverDescriptionFontSize, setCoverDescriptionFontSize] = useState(
        config.cover?.descriptionStyles?.size || 10
    )
    const [successTitleFontSize, setSuccessTitleFontSize] = useState(
        config.success?.titleStyles?.size || 20
    )
    const [successDescriptionFontSize, setSuccessDescriptionFontSize] = useState(
        config.success?.descriptionStyles?.size || 10
    )
    const [descriptionType, setDescriptionType] = useState<'text' | 'image'>(
        config.success?.image ? 'image' : 'text'
    )

    const renderTabSection = (): ReactNode => {
        switch (tab.key) {
            case 'fundraise': {
                const showTokenFields =
                    config.address &&
                    config.token?.address &&
                    config.token?.chain &&
                    config.token?.symbol

                return (
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            {JSON.stringify(config, null, 2)}
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
                            <h2 className="text-lg">Token Chain</h2>
                            <Select
                                defaultValue={config.token?.chain}
                                disabled={!config.token?.address}
                                onValueChange={async (chain: ChainKey) => {
                                    if (!config.token?.address) return
                                    try {
                                        const symbol = await getTokenSymbol(
                                            config.token.address,
                                            chain
                                        )
                                        updateConfig({
                                            token: {
                                                ...config.token,
                                                chain,
                                                symbol,
                                            },
                                        })
                                    } catch (e) {
                                        const error = e as Error
                                        toast.error(error.message)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedChains.map((chain) => (
                                        <SelectItem key={chain.id} value={chain.key}>
                                            {chain.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
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
                                                                    amounts.length > 3
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
                                                                    amounts: [
                                                                        ...amounts,
                                                                        Number(amount),
                                                                    ],
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
                                                                <Trash />
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
                    </>
                )
            }

            case 'success': {
                return (
                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Screen Type</h2>
                                <RadioGroup
                                    defaultValue={descriptionType}
                                    className="flex flex-row"
                                    onValueChange={(val) => {
                                        const value = val as 'image' | 'text'
                                        setDescriptionType(value as typeof descriptionType)
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
                                {descriptionType === 'image' ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <label
                                            htmlFor="success-image"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            {config.success?.image ? 'Update' : 'Upload'} Image
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

                                                    const filePath = await uploadImage({
                                                        base64String,
                                                        contentType,
                                                    })

                                                    if (filePath) {
                                                        const imageUrl = `${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath}`
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                image: imageUrl,
                                                            },
                                                        })
                                                    }
                                                }
                                            }}
                                        />
                                        {config.success?.image ? (
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    updateConfig({
                                                        cover: { ...config.cover, image: null },
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
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg">Title</h2>
                                                <Input
                                                    defaultValue={config.success?.title}
                                                    onChange={(e) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                title: e.target.value,
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <h2 className="text-lg">Description (Optional)</h2>
                                                <Textarea
                                                    className="w-full"
                                                    defaultValue={config.success?.description}
                                                    onChange={(e) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                description: e.target.value,
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Styles config */}
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Background
                                                </h2>
                                                <ColorPicker
                                                    className="w-full"
                                                    enabledPickers={['solid', 'gradient', 'image']}
                                                    background={
                                                        config.success?.background || '#09203f'
                                                    }
                                                    setBackground={(value) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                background: value,
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
                                                <h2 className="text-lg font-semibold">
                                                    Title Color
                                                </h2>
                                                <ColorPicker
                                                    className="w-full"
                                                    background={
                                                        config.success?.titleStyles?.color ||
                                                        '#1c1c1c'
                                                    }
                                                    setBackground={(color) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    color,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <label className="text-lg font-semibold">
                                                    Title Size ({successTitleFontSize}px)
                                                </label>

                                                <Slider
                                                    defaultValue={[successTitleFontSize]}
                                                    max={140}
                                                    step={2}
                                                    onValueChange={(newRange) => {
                                                        const size = newRange[0]
                                                        setSuccessTitleFontSize(size)
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    size,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Title Font
                                                </h2>
                                                <FontFamilyPicker
                                                    defaultValue={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    onSelect={(family) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    family,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Title Style
                                                </h2>
                                                <FontStylePicker
                                                    currentFont={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    defaultValue={
                                                        config.success?.titleStyles?.style ||
                                                        'normal'
                                                    }
                                                    onSelect={(style: string) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    style,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Title Weight
                                                </h2>
                                                <FontWeightPicker
                                                    currentFont={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    defaultValue={
                                                        config.success?.titleStyles?.weight ||
                                                        'normal'
                                                    }
                                                    onSelect={(weight) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    weight,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Title Alignment
                                                </h2>{' '}
                                                <Select
                                                    defaultValue={
                                                        config.success?.titleStyles?.position ||
                                                        'center'
                                                    }
                                                    onValueChange={(
                                                        position: 'left' | 'center' | 'right'
                                                    ) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success?.titleStyles,
                                                                    position,
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
                                                        <SelectItem value={'center'}>
                                                            Center
                                                        </SelectItem>
                                                        <SelectItem value={'right'}>
                                                            Right
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Description Color
                                                </h2>
                                                <ColorPicker
                                                    className="w-full"
                                                    background={
                                                        config.success?.descriptionStyles?.color ||
                                                        '#1c1c1c'
                                                    }
                                                    setBackground={(color) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                descriptionStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    color,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <label className="text-lg font-semibold">
                                                    Description Size ({successDescriptionFontSize}
                                                    px)
                                                </label>
                                                <Slider
                                                    defaultValue={[successDescriptionFontSize]}
                                                    max={140}
                                                    step={2}
                                                    onValueChange={(newRange) => {
                                                        const size = newRange[0]
                                                        setSuccessDescriptionFontSize(size)
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                titleStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    size,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Description Font
                                                </h2>
                                                <FontFamilyPicker
                                                    defaultValue={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    onSelect={(family) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                descriptionStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    family,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Description Style
                                                </h2>
                                                <FontStylePicker
                                                    currentFont={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    defaultValue={
                                                        config.success?.titleStyles?.style ||
                                                        'normal'
                                                    }
                                                    onSelect={(style) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                descriptionStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    style,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Description Weight
                                                </h2>
                                                <FontWeightPicker
                                                    currentFont={
                                                        config.success?.titleStyles?.family ||
                                                        'Roboto'
                                                    }
                                                    defaultValue={
                                                        config.success?.titleStyles?.weight ||
                                                        'normal'
                                                    }
                                                    onSelect={(weight) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                descriptionStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    weight,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <h2 className="text-lg font-semibold">
                                                    Description Alignment
                                                </h2>{' '}
                                                <Select
                                                    defaultValue={
                                                        config.success?.titleStyles?.position ||
                                                        'center'
                                                    }
                                                    onValueChange={(
                                                        position: 'left' | 'center' | 'right'
                                                    ) => {
                                                        updateConfig({
                                                            success: {
                                                                ...config.success,
                                                                descriptionStyles: {
                                                                    ...config.success
                                                                        ?.descriptionStyles,
                                                                    position,
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
                                                        <SelectItem value={'center'}>
                                                            Center
                                                        </SelectItem>
                                                        <SelectItem value={'right'}>
                                                            Right
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            default: {
                return (
                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg">Title</h2>
                                <Input
                                    defaultValue={config.cover?.title}
                                    onChange={(e) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                title: e.target.value,
                                            },
                                        })
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg">Description</h2>
                                <Textarea
                                    className="w-full"
                                    defaultValue={config.cover?.description}
                                    onChange={(e) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                description: e.target.value,
                                            },
                                        })
                                    }}
                                />
                            </div>
                        </div>
                        {/* Styles config */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Background</h2>
                                <ColorPicker
                                    className="w-full"
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    background={config.cover?.background || '#09203f'}
                                    setBackground={(value) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                background: value,
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
                                <h2 className="text-lg font-semibold">Progress bar Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.cover?.barColor || 'yellow'}
                                    setBackground={(barColor) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                barColor,
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
                                    background={config.cover?.titleStyles?.color || '#1c1c1c'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
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
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
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
                                    defaultValue={config.cover?.titleStyles?.family || 'Roboto'}
                                    onSelect={(family) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
                                                    family,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Style</h2>
                                <FontStylePicker
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.style || 'normal'}
                                    onSelect={(style: string) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
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
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.weight || 'normal'}
                                    onSelect={(weight) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
                                                    weight,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Alignment</h2>{' '}
                                <Select
                                    defaultValue={config.cover?.titleStyles?.position || 'center'}
                                    onValueChange={(position: 'left' | 'center' | 'right') => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.titleStyles,
                                                    position,
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
                                <h2 className="text-lg font-semibold">Description Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.cover?.descriptionStyles?.color || '#1c1c1c'}
                                    setBackground={(color) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                descriptionStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    color,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-lg font-semibold">
                                    Description Size ({coverDescriptionFontSize}px)
                                </label>
                                <Slider
                                    defaultValue={[coverDescriptionFontSize]}
                                    max={140}
                                    step={2}
                                    onValueChange={(newRange) => {
                                        const size = newRange[0]
                                        setCoverDescriptionFontSize(size)
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                titleStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    size,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Description Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.cover?.titleStyles?.family || 'Roboto'}
                                    onSelect={(family) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                descriptionStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    family,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Description Style</h2>
                                <FontStylePicker
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.style || 'normal'}
                                    onSelect={(style) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                descriptionStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    style,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Description Weight</h2>
                                <FontWeightPicker
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.weight || 'normal'}
                                    onSelect={(weight) => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                descriptionStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    weight,
                                                },
                                            },
                                        })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Description Alignment</h2>{' '}
                                <Select
                                    defaultValue={config.cover?.titleStyles?.position || 'center'}
                                    onValueChange={(position: 'left' | 'center' | 'right') => {
                                        updateConfig({
                                            cover: {
                                                ...config.cover,
                                                descriptionStyles: {
                                                    ...config.cover?.descriptionStyles,
                                                    position,
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
                )
            }
        }
    }

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex flex-row gap-4 w-full">
                {tabs.map((item) => (
                    <Button
                        variant="ghost"
                        key={item.key}
                        className={`justify-start ${
                            item.active
                                ? 'bg-muted hover:bg-muted'
                                : 'hover:bg-transparent hover:underline'
                        }`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        {item.title}
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-2xl font-medium">{tab.title}</h2>
                <p className="text-sm text-muted-foreground">{tab.description}</p>
                <Separator />
            </div>
            <div className="flex flex-col gap-4 w-full">{renderTabSection()}</div>
        </div>
    )
}
