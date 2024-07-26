'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks'
import { type ReactNode, useRef, useState } from 'react'
import type { Config } from '.'
import { Separator } from '@/components/shadcn/Separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { type ChainKey, getTokenSymbol, supportedChains } from './utils/viem'
import { Switch } from '@/components/shadcn/Switch'
import { Label } from '@/components/shadcn/InputLabel'
import { Trash } from 'lucide-react'
import { formatSymbol } from './utils/shared'
import toast from 'react-hot-toast'
import { number } from 'zod'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
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
            description: 'Configure what shows up on your Cover screen.',
        },
        {
            title: 'Success Screen',
            key: 'success',
            description: 'Configure what shows up on your Success screen.',
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
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('fundraise')

    const amounts = config.amounts || []

    const disableAmountsField = amounts.length >= 3
    const tab = sidebarNavItems({ tab: activeTab, showOne: true })
    const tabs = sidebarNavItems({ tab: activeTab })

    const amountInputRef = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()

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
                                            onCheckedChange={(checked) => {
                                                const enablePredefinedAmounts = checked
                                                updateConfig({
                                                    enablePredefinedAmounts,
                                                    ...(!enablePredefinedAmounts
                                                        ? { amounts: [] }
                                                        : {}),
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
                                                                Number(number) < 0
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
                return <div>Success</div>
            }

            default: {
                return (
                    <div className="flex flex-col gap-5 w-full">
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
                        <div className="flex flex-col gap-4">
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

                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Color</h2>
                                <ColorPicker
                                    className="w-full"
                                    background={config.cover?.titleStyles?.color || '#1c1c1c'}
                                    setBackground={(value) => {
                                        // updateConfig({
                                        // })
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Size</h2>
                                <Input
                                    defaultValue={config.cover?.titleStyles?.size}
                                    placeholder="20px"
                                    className="text-lg"
                                    onChange={(e) => {
                                        updateConfig({})
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Font</h2>
                                <FontFamilyPicker
                                    defaultValue={config.cover?.titleStyles?.family || 'Roboto'}
                                    onSelect={(font) => {
                                        //
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Style</h2>
                                <FontStylePicker
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.style || 'normal'}
                                    onSelect={(style: string) => {
                                        //
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Weight</h2>
                                <FontWeightPicker
                                    currentFont={config.cover?.titleStyles?.family || 'Roboto'}
                                    defaultValue={config.cover?.titleStyles?.weight || 'normal'}
                                    onSelect={(weight: string) => {
                                        //
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold">Title Alignment</h2>{' '}
                                <Select
                                    defaultValue={config.cover?.titleStyles?.position || 'center'}
                                    onValueChange={(value: 'left' | 'center' | 'right') => {
                                        //
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

                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg">Description</h2>
                            <Input
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
