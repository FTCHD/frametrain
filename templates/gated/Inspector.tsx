'use client'

import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import type { Config } from '.'
import { Textarea } from '@/components/shadcn/Textarea'
import { Checkbox } from '@/components/shadcn/Checkbox'
import { useEffect, useState, type ReactNode } from 'react'
import { Label } from '@/components/shadcn/InputLabel'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Button } from '@/components/shadcn/Button'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({
        like: false,
        recast: false,
        follower: false,
        following: false,
        badge: false,
        eth: false,
        sol: false,
        channels: false,
        fid: false,
        score: false,
        erc721: false,
        erc1155: false,
    })
    const [messageType, setMessageType] = useState<'text' | 'image'>('text')
    const uploadImage = useUploadImage()

    useEffect(() => {
        console.log('Selected options:', selectedOptions)
    }, [selectedOptions])

    const requirements: {
        key: string
        label: string
        isBasic: boolean
        children?: ReactNode
    }[] = [
        {
            key: 'like',
            label: 'Must Like',
            isBasic: true,
        },
        {
            key: 'recast',
            label: 'Must Recast',
            isBasic: true,
        },
        {
            key: 'follower',
            label: 'Must Follow Me',
            isBasic: true,
        },
        {
            key: 'following',
            label: 'Must be Someone I Follow',
            isBasic: true,
        },
        {
            key: 'badge',
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
        },
        {
            key: 'fid',
            label: 'FID must be less than',
            isBasic: false,
            children: <Input type="number" />,
        },
        {
            key: 'score',
            label: 'Must have Open Rank Engagement Score',
            isBasic: false,
        },
        {
            key: 'erc721',
            label: 'Must Hold ERC-721',
            isBasic: false,
        },
        {
            key: 'erc1155',
            label: 'Must Hold ERC-1155',
            isBasic: false,
        },
        {
            key: 'erc20',
            label: 'Must Hold ERC-20',
            isBasic: false,
        },
    ]

    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <p>{JSON.stringify(config)}</p>
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

                                    setSelectedOptions((prev) => ({
                                        ...prev,
                                        [requirement.key]: checked,
                                    }))
                                }}
                            />
                            <Label
                                htmlFor={requirement.key}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {requirement.label}
                            </Label>
                        </div>
                        {selectedOptions?.[requirement.key] && requirement.children
                            ? requirement.children
                            : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
