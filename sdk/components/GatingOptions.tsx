'use client'

import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/Label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { type ReactNode, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getFarcasterChannelbyName } from '../neynar'
import { LoaderIcon, Trash } from 'lucide-react'
import { Slider } from '@/components/shadcn/Slider'
import Link from 'next/link'
import { Checkbox } from '@/components/shadcn/Checkbox'

export type GatingERCType = {
    network?: string
    address?: string
    balance?: number
    tokenId?: string
    collection?: string
}
type GatingConfig = {
    followed: boolean
    following: boolean
    liked: boolean
    casted: boolean
    eth: boolean
    sol: boolean
    power: boolean
    channels: { checked: boolean; data: string[] }
    maxFid: number
    score: number
    erc20: GatingERCType | null
    erc721: GatingERCType | null
    erc1155: GatingERCType | null
    viewer: { fid: number; username: string } | null
}
type GatingTypes =
    | 'followed'
    | 'following'
    | 'liked'
    | 'casted'
    | 'eth'
    | 'sol'
    | 'power'
    | 'channels'
    | 'maxFid'
    | 'score'
    | 'erc20'
    | 'erc721'
    | 'erc1155'
    | 'viewer'

type Options = GatingTypes

type GatingOptionsProps = {
    config: GatingConfig
    onUpdate: (updatedGatingConfig: GatingConfig) => void
    enabledOptions?: Options[]
}

const TokenGating = ({
    onChange,
    defaultValues,
    loading = false,
    id,
}: {
    onChange: (v: GatingERCType) => void
    defaultValues: GatingERCType
    loading?: boolean
    id: 'erc721' | 'erc1155' | 'erc20'
}) => {
    return (
        <>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="network" className="text-sm font-medium leading-none">
                    Network
                </Label>
                <Select
                    defaultValue={defaultValues.network as string | undefined}
                    onValueChange={(network) => {
                        onChange({ ...defaultValues, network })
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ETH">Ethereum MainNet</SelectItem>
                        <SelectItem value="BASE">Base</SelectItem>
                        <SelectItem value="OP">Optimism</SelectItem>
                        <SelectItem value="ZORA">Zora</SelectItem>
                        <SelectItem value="BLAST">Blast</SelectItem>
                        <SelectItem value="POLYGON">Polygon</SelectItem>
                        <SelectItem value="FANTOM">Fantom</SelectItem>
                        <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                        <SelectItem value="BNB">Bnb</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="address" className="text-sm font-medium leading-none">
                    Address
                </Label>
                <Input
                    id="address"
                    disabled={loading || !defaultValues.network}
                    type="text"
                    placeholder="0x8c678ghybv...."
                    defaultValue={defaultValues.address}
                    onChange={(e) => {
                        const address = e.target.value
                        onChange({
                            ...defaultValues,
                            address: address.length === 0 ? undefined : address,
                        })
                    }}
                />
            </div>
            <div className="flex flex-row items-center w-full gap-2">
                <Label htmlFor="balance" className="text-sm font-medium leading-none">
                    Minimum Balance <br /> (optional)
                </Label>
                <Input
                    id="balance"
                    type="number"
                    placeholder="300 for 300 USDC or Token value"
                    disabled={!(defaultValues.address && defaultValues.network)}
                    defaultValue={defaultValues.balance}
                    onChange={(e) => {
                        const value = e.target.value
                        const balance = value === '' ? 0 : Number.parseFloat(value)
                        if (isNaN(balance)) {
                            toast.error('Please enter a valid amount')
                            return
                        }
                        onChange({ ...defaultValues, balance: balance === 0 ? undefined : balance })
                    }}
                />
            </div>
            {id === 'erc1155' ? (
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="tokenId" className="text-sm font-medium leading-none">
                        Token ID
                    </Label>
                    <Input
                        id="tokenId"
                        type="text"
                        placeholder="1"
                        disabled={!(defaultValues.address && defaultValues.network)}
                        defaultValue={defaultValues.tokenId}
                        onChange={(e) => {
                            const tokenId = e.target.value

                            onChange({
                                ...defaultValues,
                                tokenId: tokenId.length === 0 ? undefined : tokenId,
                            })
                        }}
                    />
                </div>
            ) : null}

            {id !== 'erc20' ? (
                <div className="flex flex-row items-center w-full gap-2">
                    <Label htmlFor="collection" className="text-sm font-medium leading-none">
                        Collection URL
                    </Label>
                    <Input
                        id="collection"
                        type="text"
                        placeholder="https://opensea.io/collection/xyz"
                        disabled={!(defaultValues.address && defaultValues.network)}
                        defaultValue={defaultValues.collection}
                        onChange={(e) => {
                            const collection = e.target.value

                            onChange({
                                ...defaultValues,
                                collection: collection.length === 0 ? undefined : collection,
                            })
                        }}
                    />
                </div>
            ) : null}
        </>
    )
}

export default function GatingOptions({
    config,
    onUpdate,
    enabledOptions = ['following'],
}: GatingOptionsProps) {
    const [addingChannel, setAddingChannel] = useState(false)
    const channelInputRef = useRef<HTMLInputElement>(null)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(
        config
            ? {
                  liked: config.liked,
                  recasted: config.casted,
                  followed: config.followed,
                  following: config.following,
                  power: config.power,
                  eth: config.eth,
                  sol: config.sol,
                  channels: config.channels.data.length > 0 || config.channels.checked,
                  fid: (config.maxFid || 0) > 0,
                  score: config.score > 0,
                  erc721: Boolean(config.erc721),
                  erc1155: Boolean(config.erc1155),
                  erc20: Boolean(config.erc20),
              }
            : {
                  liked: false,
                  recasted: false,
                  followed: false,
                  following: false,
                  power: false,
                  eth: false,
                  sol: false,
                  channels: false,
                  fid: false,
                  score: false,
                  erc721: false,
                  erc1155: false,
                  erc20: false,
              }
    )

    const requirements: {
        key: string
        label: string
        isBasic: boolean
        children?: ReactNode
        onChange?: (value: boolean) => void
        enabled: boolean
    }[] = [
        {
            key: 'liked',
            label: 'Must Like',
            isBasic: true,
            enabled: enabledOptions.includes('liked'),
        },
        {
            key: 'recasted',
            label: 'Must Recast',
            isBasic: true,
            enabled: enabledOptions.includes('casted'),
        },
        {
            key: 'followed',
            label: 'Must Follow Me',
            isBasic: true,
            enabled: enabledOptions.includes('followed'),
        },
        {
            key: 'following',
            label: 'Must be Someone I Follow',
            isBasic: true,
            enabled: enabledOptions.includes('following'),
        },
        {
            key: 'power',
            label: 'Must have a Power Badge',
            isBasic: true,
            enabled: enabledOptions.includes('power'),
        },
        {
            key: 'eth',
            label: 'Must Have ETH Address Setup',
            isBasic: true,
            enabled: enabledOptions.includes('eth'),
        },
        {
            key: 'sol',
            label: 'Must Have SOL Address Setup',
            isBasic: true,
            enabled: enabledOptions.includes('liked'),
        },
        {
            key: 'channels',
            label: 'Must be a member of channel(s)',
            isBasic: false,
            enabled: enabledOptions.includes('channels'),
            onChange: (checked: boolean) => {
                onUpdate({
                    ...config,
                    channels: {
                        ...config.channels,
                        checked,
                    },
                })
            },
            children: (
                <>
                    <div className="flex flex-row justify-center gap-2 w-full items-center">
                        <Input
                            disabled={addingChannel || config.channels.data.length >= 4}
                            ref={channelInputRef}
                            className="text-lg border rounded py-2 px-4 w-full"
                        />
                        <Button
                            type="button"
                            disabled={addingChannel}
                            className="px-4 py-2 rounded-md"
                            onClick={async () => {
                                if (!channelInputRef.current) return

                                const channel = channelInputRef.current.value.trim()

                                if (channel.length < 3) return
                                setAddingChannel(true)

                                try {
                                    const channelInfo = await getFarcasterChannelbyName(channel)

                                    if (!channelInfo) {
                                        toast.error(`No channel found with name ${channel}`)
                                        return
                                    }

                                    onUpdate({
                                        ...config,
                                        channels: {
                                            ...config.channels,
                                            data: [...(config.channels.data || []), channel],
                                        },
                                    })

                                    channelInputRef.current.value = ''
                                } catch {
                                    toast.error('Failed to fetch channel')
                                } finally {
                                    setAddingChannel(false)
                                }
                            }}
                        >
                            {addingChannel ? (
                                <LoaderIcon className="animate-spin" />
                            ) : (
                                'Add Channel'
                            )}
                        </Button>
                    </div>

                    {config.channels.data.length ? (
                        <div className="flex flex-col gap-1 w-full">
                            {config.channels.data.map((channel, index) => (
                                <div
                                    key={index}
                                    className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                                >
                                    <span>
                                        {index + 1}. {channel}
                                    </span>
                                    <Button
                                        variant={'destructive'}
                                        onClick={() =>
                                            onUpdate({
                                                ...config,
                                                channels: {
                                                    ...config.channels,
                                                    data: [
                                                        ...config.channels.data.slice(0, index),
                                                        ...config.channels.data.slice(index + 1),
                                                    ],
                                                },
                                            })
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </>
            ),
        },
        {
            key: 'fid',
            label: 'FID must be less than',
            isBasic: false,
            enabled: enabledOptions.includes('maxFid'),
            children: (
                <>
                    <div className="flex flex-row items-center">
                        <Label htmlFor="fid" className="text-sm font-medium leading-none w-1/2">
                            Max FID:
                        </Label>
                        <Input
                            id="fid"
                            type="number"
                            min={1}
                            className="w-full"
                            onChange={(e) => {
                                const value = e.target.value
                                const maxFid = value === '' ? 0 : Number(value)
                                setSelectedOptions({
                                    ...selectedOptions,
                                    fid: maxFid > 0,
                                })
                                onUpdate({ ...config, maxFid })
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Only users with FID less than this value will be able eligible for the
                        rewards
                    </p>
                </>
            ),
        },
        {
            key: 'score',
            label: 'Must have Open Rank Engagement Score',
            isBasic: false,
            enabled: enabledOptions.includes('score'),
            children: (
                <>
                    <div className="flex flex-row items-center w-full">
                        <Label htmlFor="score" className="text-sm font-medium leading-none w-1/2">
                            Open Rank Reputation Degree:
                        </Label>
                        <Slider
                            id="score"
                            min={1}
                            max={5}
                            step={1}
                            className="w-full"
                            onValueChange={([score]) => {
                                setSelectedOptions({
                                    ...selectedOptions,
                                    score: score > 0,
                                })
                                onUpdate({ ...config, score })
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Only users with a repuation degree of this value will be eligible for the
                        rewards. To learn more about Open Rank, visit{' '}
                        <Link className="underline" href="https://openrank.com/" target="_blank">
                            OpenRank
                        </Link>
                    </p>
                </>
            ),
        },
        {
            key: 'erc721',
            label: 'Must Hold ERC-721',
            isBasic: false,
            enabled: enabledOptions.includes('erc721'),
            onChange(value) {
                if (!value) {
                    onUpdate({
                        ...config,
                        erc721: null,
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc721"
                    defaultValues={{
                        network: config.erc721?.network,
                        address: config.erc721?.address as string | undefined,
                        balance: config.erc721?.balance || 0,
                        collection: config.erc721?.collection as string | undefined,
                    }}
                    onChange={(erc721) => {
                        onUpdate({
                            ...config,
                            erc721,
                        })
                    }}
                />
            ),
        },
        {
            key: 'erc1155',
            label: 'Must Hold ERC-1155',
            isBasic: false,
            enabled: enabledOptions.includes('erc1155'),
            onChange(value) {
                if (!value) {
                    onUpdate({
                        ...config,
                        erc1155: null,
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc1155"
                    defaultValues={{
                        network: config.erc1155?.network,
                        address: config.erc1155?.address as string | undefined,
                        balance: config.erc1155?.balance || 0,
                        tokenId: config.erc1155?.tokenId as string | undefined,
                        collection: config.erc1155?.collection as string | undefined,
                    }}
                    onChange={(erc1155) => {
                        onUpdate({
                            ...config,
                            erc1155,
                        })
                    }}
                />
            ),
        },
        {
            key: 'erc20',
            label: 'Must Hold ERC-20',
            isBasic: false,
            enabled: enabledOptions.includes('erc20'),
            onChange(value) {
                if (!value) {
                    onUpdate({
                        ...config,
                        erc20: null,
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc20"
                    defaultValues={{
                        network: config.erc20?.network,
                        address: config.erc20?.address as string | undefined,
                        balance: config.erc20?.balance || 0,
                        tokenId: undefined,
                        collection: config.erc20?.collection as string | undefined,
                    }}
                    onChange={(erc20) => {
                        onUpdate({
                            ...config,
                            erc20,
                        })
                    }}
                />
            ),
        },
    ]
    const options = requirements.filter((op) => op.enabled)
    const enableUsername = enabledOptions.includes('followed')

    return (
        <div className="flex flex-col gap-4 w-full">
            {options.map((option) => (
                <div key={option.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={option.key}
                            checked={selectedOptions[option.key]}
                            onCheckedChange={(checked: boolean) => {
                                setSelectedOptions({
                                    ...selectedOptions,
                                    [option.key]: checked,
                                })

                                if (option.isBasic) {
                                    onUpdate({
                                        ...config,
                                        [option.key]: checked,
                                    })
                                } else {
                                    option.onChange?.(checked)
                                }
                            }}
                        />
                        <Label
                            htmlFor={option.key}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {option.label}
                        </Label>
                    </div>
                    {selectedOptions?.[option.key] && option.children ? (
                        <div className="flex flex-col gap-2 w-full">{option.children}</div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
