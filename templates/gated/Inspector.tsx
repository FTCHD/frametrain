'use client'

import { Button } from '@/components/shadcn/Button'
import { Checkbox } from '@/components/shadcn/Checkbox'
import { Input } from '@/components/shadcn/Input'
import { Label } from '@/components/shadcn/InputLabel'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Slider } from '@/components/shadcn/Slider'
import { Textarea } from '@/components/shadcn/Textarea'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { getFarcasterChannelbyName } from '@/sdk/neynar'
import { corsFetch } from '@/sdk/scrape'
import { LoaderIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { type MutableRefObject, type ReactNode, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import TokenGating from './components/TokenGating'

const warpcastBaseApiUrl = 'https://api.warpcast.com/v2'

function getRequirementsCheckboxes(
    config: Config,
    updateConfig: any,
    setSelectedOptions: any,
    selectedOptions: any,
    addingChannel: any,
    setAddingChannel: any,
    channelInputRef: MutableRefObject<HTMLInputElement | null>
): {
    key: string
    label: string
    isBasic: boolean
    children?: ReactNode
    onChange?: (value: boolean) => void
}[] {
    return [
        {
            key: 'liked',
            label: 'Must Like',
            isBasic: true,
        },
        {
            key: 'recasted',
            label: 'Must Recast',
            isBasic: true,
        },
        {
            key: 'followed',
            label: 'Must Follow Me',
            isBasic: true,
        },
        {
            key: 'following',
            label: 'Must be Someone I Follow',
            isBasic: true,
        },
        {
            key: 'power',
            label: 'Must have a Power Badge',
            isBasic: true,
        },
        {
            key: 'eth',
            label: 'Must Have ETH Address Setup',
            isBasic: true,
        },
        {
            key: 'sol',
            label: 'Must Have SOL Address Setup',
            isBasic: true,
        },
        {
            key: 'channels',
            label: 'Must be a member of channel(s)',
            isBasic: false,
            onChange: (checked: boolean) => {
                updateConfig({
                    ...config,
                    requirements: {
                        ...config.requirements,
                        channels: {
                            ...config.requirements.channels,
                            checked,
                        },
                    },
                })
            },
            children: (
                <>
                    <div className="flex flex-row justify-center gap-2 w-full items-center">
                        <Input
                            disabled={
                                addingChannel || config.requirements.channels.data.length >= 4
                            }
                            ref={channelInputRef}
                            className="text-lg border rounded py-2 px-4 w-full"
                        />
                        <Button
                            type="button"
                            disabled={addingChannel}
                            className="px-4 py-2 rounded-md"
                            onClick={async () => {
                                if (!channelInputRef?.current) return

                                const channel = channelInputRef?.current.value.trim()

                                if (channel.length < 3) return
                                setAddingChannel(true)

                                try {
                                    const channelInfo = await getFarcasterChannelbyName(channel)
                                    console.log(`Channel Info for ${channel}`, channelInfo)

                                    if (!channelInfo) {
                                        toast.error(`No channel found with name ${channel}`)
                                        return
                                    }

                                    updateConfig({
                                        requirements: {
                                            ...config.requirements,
                                            channels: {
                                                ...config.requirements.channels,
                                                data: [
                                                    ...(config.requirements.channels.data || []),
                                                    channel,
                                                ],
                                            },
                                        },
                                    })

                                    channelInputRef.current.value = ''
                                } catch (error) {
                                    console.error('Failed to fetch channel', error)

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

                    {config.requirements.channels.data.length ? (
                        <div className="flex flex-col gap-1 w-full">
                            {config.requirements.channels.data.map((channel, index) => (
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
                                            updateConfig({
                                                requirements: {
                                                    ...config.requirements,
                                                    channels: {
                                                        ...config.requirements.channels,
                                                        data: [
                                                            ...config.requirements.channels.data.slice(
                                                                0,
                                                                index
                                                            ),
                                                            ...config.requirements.channels.data.slice(
                                                                index + 1
                                                            ),
                                                        ],
                                                    },
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
                                updateConfig({ maxFid })
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
                                updateConfig({ score })
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
            onChange(value) {
                if (!value) {
                    updateConfig({
                        requirements: {
                            ...config.requirements,
                            erc721: null,
                        },
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc721"
                    defaultValues={{
                        network: config.requirements.erc721?.network,
                        address: config.requirements.erc721?.address as string | undefined,
                        balance: config.requirements.erc721?.balance || 0,
                        collection: config.requirements.erc721?.collection as string | undefined,
                        tokenId: undefined,
                    }}
                    onChange={(erc721) => {
                        updateConfig({
                            requirements: {
                                ...config.requirements,
                                erc721,
                            },
                        })
                    }}
                />
            ),
        },
        {
            key: 'erc1155',
            label: 'Must Hold ERC-1155',
            isBasic: false,
            onChange(value) {
                if (!value) {
                    updateConfig({
                        requirements: {
                            ...config.requirements,
                            erc1155: null,
                        },
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc1155"
                    defaultValues={{
                        network: config.requirements.erc1155?.network,
                        address: config.requirements.erc1155?.address as string | undefined,
                        balance: config.requirements.erc1155?.balance || 0,
                        tokenId: config.requirements.erc1155?.tokenId as string | undefined,
                        collection: config.requirements.erc1155?.collection as string | undefined,
                    }}
                    onChange={(erc1155) => {
                        updateConfig({
                            requirements: {
                                ...config.requirements,
                                erc1155,
                            },
                        })
                    }}
                />
            ),
        },
        {
            key: 'erc20',
            label: 'Must Hold ERC-20',
            isBasic: false,
            onChange(value) {
                if (!value) {
                    updateConfig({
                        requirements: {
                            ...config.requirements,
                            erc20: null,
                        },
                    })
                }
            },
            children: (
                <TokenGating
                    id="erc20"
                    defaultValues={{
                        network: config.requirements.erc20?.network,
                        address: config.requirements.erc20?.address as string | undefined,
                        balance: config.requirements.erc20?.balance || 0,
                        tokenId: undefined,
                        collection: config.requirements.erc20?.collection as string | undefined,
                    }}
                    onChange={(erc20) => {
                        updateConfig({
                            requirements: {
                                ...config.requirements,
                                erc20,
                            },
                        })
                    }}
                />
            ),
        },
    ]
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(
        config.requirements
            ? {
                  ...config.requirements.basic,
                  channels:
                      config.requirements.channels.data.length > 0 ||
                      config.requirements.channels.checked,
                  fid: (config.requirements.maxFid || 0) > 0,
                  score: config.requirements.score > 0,
                  erc721: Boolean(config.requirements.erc721),
                  erc1155: Boolean(config.requirements.erc1155),
                  erc20: Boolean(config.requirements.erc20),
              }
            : {
                  liked: false,
                  recasted: false,
                  follower: false,
                  following: false,
                  power: false,
                  eth: false,
                  sol: false,
                  channels: false,
                  fid: false,
                  score: false,
                  erc721: false,
                  erc1155: false,
              }
    )
    const [messageType, setMessageType] = useState<'text' | 'image'>('text')
    const [addingChannel, setAddingChannel] = useState(false)
    const disableLinksField = config.links?.length >= 4
    const linkInputRef = useRef<HTMLInputElement>(null)
    const channelInputRef = useRef<HTMLInputElement>(null)

    const uploadImage = useUploadImage()

    const onChangeLabel = useDebouncedCallback(async (label: string) => {
        if (label === config.label) {
            return
        }
        updateConfig({
            label: label === '' ? null : label,
        })
    }, 1000)

    const onChangeUsername = useDebouncedCallback(async (username: string) => {
        if (username === '' || username === config.owner?.username) {
            return
        }

        try {
            const response = await corsFetch(
                `${warpcastBaseApiUrl}/user-by-username?username=${username}`,
                {
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                    },
                }
            )

            if (!response) return

            const data = JSON.parse(response) as unknown as
                | {
                      result: { user: { fid: number; username: string } }
                  }
                | { errors: unknown[] }

            if ('errors' in data) {
                toast.error(`No FID associated with username ${username}`)
                return
            }
            updateConfig({
                owner: {
                    fid: data.result.user.fid,
                    username: data.result.user.username,
                },
            })
        } catch (e) {
            console.error('Failed to fetch FID', e)

            toast.error('Failed to fetch FID')
        }
    }, 1000)

    const requirements = useMemo(
        () =>
            getRequirementsCheckboxes(
                config,
                updateConfig,
                setSelectedOptions,
                selectedOptions,
                addingChannel,
                setAddingChannel,
                channelInputRef
            ),
        [config, selectedOptions, addingChannel, updateConfig]
    )

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <p>{JSON.stringify(config)}</p>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Button Label</h2>
                <Input
                    className="w-full"
                    placeholder="View"
                    defaultValue={config.label || ''}
                    onChange={async (e) => {
                        onChangeLabel(e.target.value)
                    }}
                />
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Your Farcaster username</h2>
                <Input
                    className="w-full"
                    placeholder="eg. vitalik.eth"
                    defaultValue={config.owner?.username}
                    onChange={async (e) => onChangeUsername(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Welcome Text</h2>

                <Textarea
                    className="w-full"
                    placeholder="Limited invites for x NFT Holders"
                    onChange={(e) => {
                        const value = e.target.value
                        updateConfig({ welcomeText: value === '' ? null : value })
                    }}
                />
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">
                    What will be revealed as the reward message?
                </h2>

                <Select
                    defaultValue={messageType}
                    onValueChange={(message: 'text' | 'image') => setMessageType(message)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select your rewards message type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2 w-full">
                {messageType === 'text' ? (
                    <>
                        <h2 className="text-lg font-semibold">Your reward message</h2>
                        <Textarea
                            className="w-full"
                            placeholder="You've unlocked a special reward!"
                            onChange={(e) => {
                                const value = e.target.value
                                updateConfig({ rewardMesssage: value === '' ? null : value })
                            }}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <label
                            htmlFor="success-image"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            {config.rewardImage ? 'Update' : 'Upload'} Image
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
                                            const base64String = (reader.result as string).split(
                                                ','
                                            )[1]
                                            resolve(base64String)
                                        }
                                    })) as string

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
                                            rewardImage: imageUrl,
                                        })
                                    }
                                }
                            }}
                        />
                        {config.rewardImage ? (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    updateConfig({
                                        rewardImage: null,
                                    })
                                }}
                                className="w-full"
                            >
                                Remove
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg">Add a Link</h2>
                <div className="flex flex-row gap-2 w-full items-center">
                    <Input
                        disabled={disableLinksField}
                        ref={linkInputRef}
                        className="text-lg border rounded py-2 px-4 w-full"
                        type="url"
                    />
                    {!disableLinksField ? (
                        <Button
                            type="button"
                            disabled={disableLinksField}
                            className="px-4 py-2 rounded-md"
                            onClick={() => {
                                if (!linkInputRef.current || config.links?.length >= 4) return

                                const link = linkInputRef.current.value.trim()

                                if (link.length < 10) return

                                updateConfig({
                                    links: [...(config.links || []), link],
                                })

                                linkInputRef.current.value = ''
                            }}
                        >
                            Add Link
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Manage Links</h2>
                {!config.links?.length ? (
                    <p className="italic text-gray-300">Links added yet!</p>
                ) : (
                    <div className="w-full flex flex-col gap-2">
                        {config.links?.map((link, index) => (
                            <div
                                key={index}
                                className="flex flex-row items-center justify-between bg-slate-50 bg-opacity-10 p-2 rounded"
                            >
                                <span>
                                    {index + 1}. {link}
                                </span>
                                <Button
                                    variant={'destructive'}
                                    onClick={() =>
                                        updateConfig({
                                            links: [
                                                ...config.links.slice(0, index),
                                                ...config.links.slice(index + 1),
                                            ],
                                        })
                                    }
                                >
                                    <Trash />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 w-full">
                <h2 className="text-lg font-semibold">Requirements</h2>
                {requirements.map((requirement) => (
                    <div key={requirement.key} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={requirement.key}
                                checked={selectedOptions[requirement.key]}
                                onCheckedChange={(checked: boolean) => {
                                    console.log(`Is ${requirement.key} now checked? ${checked}`)

                                    setSelectedOptions({
                                        ...selectedOptions,
                                        [requirement.key]: checked,
                                    })

                                    if (requirement.isBasic) {
                                        updateConfig({
                                            requirements: {
                                                ...config.requirements,
                                                basic: {
                                                    ...config.requirements?.basic,
                                                    [requirement.key]: checked,
                                                },
                                            },
                                        })
                                    } else {
                                        requirement.onChange?.(checked)
                                    }
                                }}
                            />
                            <Label
                                htmlFor={requirement.key}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {requirement.label}
                            </Label>
                        </div>
                        {selectedOptions?.[requirement.key] && requirement.children ? (
                            <div className="flex flex-col gap-2 w-full">{requirement.children}</div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
