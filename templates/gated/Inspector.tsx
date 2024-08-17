'use client'

import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '.'
import { Textarea } from '@/components/shadcn/Textarea'
import { useRef, useState } from 'react'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Button } from '@/components/shadcn/Button'
import { Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import GatingOptions from '@/sdk/components/GatingOptions'
import { corsFetch } from '@/sdk/scrape'

const warpcastBaseApiUrl = 'https://api.warpcast.com/v2'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const [messageType, setMessageType] = useState<'text' | 'image'>('text')
    const disableLinksField = config.links?.length >= 4
    const linkInputRef = useRef<HTMLInputElement>(null)

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
                `${warpcastBaseApiUrl}/user-by-username?username=${username}`
            )

            if (!response) return

            const data = JSON.parse(response) as
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
        } catch {
            toast.error('Failed to fetch FID')
        }
    }, 1000)

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <p>{JSON.stringify(config)}</p>
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
                <GatingOptions
                    onUpdate={(option) => {
                        if (option.channels) {
                            updateConfig({
                                requirements: {
                                    ...config.requirements,
                                    channels: {
                                        ...config.requirements.channels,
                                        data: option.channels.data,
                                    },
                                },
                            })
                        } else {
                            updateConfig({
                                requirements: {
                                    ...config.requirements,
                                    ...option,
                                },
                            })
                        }
                    }}
                    config={config.requirements}
                />
            </div>
        </div>
    )
}
