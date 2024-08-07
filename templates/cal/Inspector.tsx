'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Switch } from '@/components/shadcn/Switch'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useResetPreview, useUploadImage } from '@/sdk/hooks'
import { corsFetch } from '@/sdk/scrape'
import { LoaderIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { fetchProfileData } from './utils/cal'
import { getDurationFormatted } from './utils/date'
import { getName } from './utils/nft'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const uploadImage = useUploadImage()
    const resetPreview = useResetPreview()

    const slugInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const events = config.events || []

    const onChangeUsername = useDebouncedCallback(async (username: string) => {
        if (config.username === username) return

        if (username === '') {
            resetPreview()
            updateConfig({
                name: undefined,
                username: undefined,
                image: undefined,
                bio: [],
                fid: undefined,
                events: [],
            })
            return
        }

        try {
            const data = await fetchProfileData(username)
            if (!data) return
            resetPreview()
            updateConfig({
                ...data,
                fid,
                events: [],
            })
        } catch {}
    }, 1000)

    const handleNFT = async (nftAddress: string) => {
        const nftName = await getName(nftAddress, config.nftOptions.nftChain)
        updateConfig({
            nftOptions: {
                ...config.nftOptions,
                nftAddress: nftAddress,
                nftName: nftName,
            },
        })
    }
    const handleChainChange = (value: any) => {
        updateConfig({
            nftOptions: {
                ...config.nftOptions,
                nftChain: value,
            },
        })
    }
    const handleNftTypeChange = (value: any) => {
        updateConfig({
            nftOptions: {
                ...config.nftOptions,
                nftType: value,
            },
        })
    }
    const handleTokenIdChange = async (e: any) => {
        updateConfig({
            nftOptions: {
                ...config.nftOptions,
                tokenId: e.target.value,
            },
        })
    }

    return (
        <div className="w-full h-full flex flex-col gap-5 max-sm:gap-3">
            <div className="flex flex-col gap-2 max-sm:gap-1">
                <h2 className="text-2xl font-semibold max-sm:text-lg">Username</h2>
                <Input
                    className="text-lg max-sm:text-base"
                    placeholder="Your Cal.com username"
                    defaultValue={config.username}
                    onChange={(e) => {
                        onChangeUsername(e.target.value)
                    }}
                />
            </div>
            <div className="flex flex-col gap-4 w-full max-sm:gap-2">
                <h2 className="text-2xl font-bold max-sm:text-lg">Event Slugs</h2>

                {events.length < 4 && (
                    <div className="flex gap-2 items-center">
                        <Input
                            ref={slugInputRef}
                            placeholder="Event ID/Slug (eg. 15min/30min/secret)"
                        />
                        <Button
                            size={'lg'}
                            variant={'secondary'}
                            disabled={loading}
                            onClick={async () => {
                                if (!slugInputRef.current?.value) return

                                setLoading(true)

                                const eventSlug = slugInputRef.current.value.trim()

                                if (!eventSlug.length) {
                                    setLoading(false)
                                    return
                                }

                                try {
                                    const text = await corsFetch(
                                        `https://cal.com/api/trpc/public/event?batch=1&input={"0":{"json":{"username":"${config.username}","eventSlug":"${eventSlug}","isTeamEvent":false,"org":null}}}`,
                                        {
                                            method: 'GET',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        }
                                    )
                                    const data = JSON.parse(text as string)
                                    const json = data[0].result.data.json

                                    if (json === null) {
                                        throw new Error('error')
                                    }

                                    const slug = data[0].result.data.json.slug as string
                                    const duration = data[0].result.data.json.length as number

                                    const newEvents = [
                                        ...events,
                                        {
                                            slug: slug,
                                            duration: duration,
                                            formattedDuration: getDurationFormatted(duration),
                                        },
                                    ]

                                    updateConfig({ events: newEvents })
                                } catch {
                                    toast.error(`No event type found for: ${eventSlug}`)
                                } finally {
                                    setLoading(false)

                                    slugInputRef.current.value = ''
                                }
                            }}
                        >
                            {loading ? <LoaderIcon className="animate-spin" /> : 'ADD'}
                        </Button>
                    </div>
                )}

                {events.map((event, index) => (
                    <div
                        className="flex flex-row gap-2 justify-between items-center w-full h-full"
                        key={event.slug}
                    >
                        <div className="flex flex-row gap-2 justify-center items-center h-full">
                            <span className="flex flex-col justify-center items-center font-bold text-black bg-white rounded-full min-w-12 min-h-12">
                                # {index}
                            </span>
                            <span className="text-md">
                                {event.slug.length > 25
                                    ? event.slug.substring(0, 25) + '...'
                                    : event.slug}
                            </span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    updateConfig({
                                        events: events.filter((e) => e.slug !== event.slug),
                                    })
                                }
                            >
                                <Trash />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold max-sm:text-lg">Gating Options</h2>
                <div className="flex flex-col gap-2 w-full md:w-auto max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">Karma Gating</h2>

                        <Switch
                            checked={config.gatingOptions.karmaGating}
                            onCheckedChange={(checked) => {
                                updateConfig({
                                    gatingOptions: {
                                        ...config.gatingOptions,
                                        karmaGating: checked,
                                    },
                                })
                            }}
                        />
                    </div>

                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only allow Farcaster users within your second-degree to book a call. To
                        learn more check out{' '}
                        <Link className="underline" href="https://openrank.com/" target="_blank">
                            OpenRank
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">NFT Gating</h2>

                        <Switch
                            checked={config.gatingOptions.nftGating}
                            onCheckedChange={(checked) => {
                                updateConfig({
                                    gatingOptions: {
                                        ...config.gatingOptions,
                                        nftGating: checked,
                                    },
                                })
                            }}
                        />
                    </div>

                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only only users users holding a specific NFT to book a call.
                    </p>
                </div>
                {config.gatingOptions.nftGating && (
                    <>
                        <div className="flex flex-col gap-2 w-full ">
                            <h2 className="text-lg font-semibold max-sm:text-base">Choose Chain</h2>
                            <Select
                                onValueChange={handleChainChange}
                                defaultValue={config.nftOptions.nftChain}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ETH">ETH</SelectItem>
                                    <SelectItem value="BASE">BASE</SelectItem>
                                    <SelectItem value="OP">OP</SelectItem>
                                    <SelectItem value="ZORA">ZORA</SelectItem>
                                    <SelectItem value="BLAST">BLAST</SelectItem>
                                    <SelectItem value="POLYGON">POLYGON</SelectItem>
                                    <SelectItem value="FANTOM">FANTOM</SelectItem>
                                    <SelectItem value="ARBITRUM">ARBITRUM</SelectItem>
                                    <SelectItem value="BNB">BNB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold max-sm:text-base">
                                Choose NFT Type
                            </h2>
                            <Select
                                defaultValue={config.nftOptions.nftType}
                                onValueChange={handleNftTypeChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select NFT type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ERC721">ERC721</SelectItem>
                                    <SelectItem value="ERC1155">ERC1155</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <h2 className="text-lg font-semibold max-sm:text-base">NFT address</h2>
                            <Input
                                className="text-lg max-sm:text-base"
                                placeholder="Enter your NFT address"
                                onChange={async (e) => {
                                    await handleNFT(e.target.value)
                                }}
                            />
                        </div>
                        {config.nftOptions.nftType === 'ERC1155' && (
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="text-lg font-semibold max-sm:text-base">Token ID</h2>
                                <Input
                                    className="text-lg max-sm:text-base"
                                    placeholder="Enter your NFT token ID"
                                    onChange={handleTokenIdChange}
                                />
                            </div>
                        )}
                    </>
                )}
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">Recasted</h2>

                        <Switch
                            checked={config.gatingOptions.recasted}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            recasted: true,
                                        },
                                    })
                                } else {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            recasted: false,
                                        },
                                    })
                                }
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only allow users who recasted this cast to book a call.
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">Liked</h2>

                        <Switch
                            checked={config.gatingOptions.liked}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            liked: true,
                                        },
                                    })
                                } else {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            liked: false,
                                        },
                                    })
                                }
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only allow users who liked this cast to book a call.
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">Follower</h2>

                        <Switch
                            checked={config.gatingOptions.follower}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            follower: true,
                                        },
                                    })
                                } else {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            follower: false,
                                        },
                                    })
                                }
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only allow users who you follow to book a call.
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg font-semibold max-sm:text-base">Following</h2>

                        <Switch
                            checked={config.gatingOptions.following}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            following: true,
                                        },
                                    })
                                } else {
                                    updateConfig({
                                        gatingOptions: {
                                            ...config.gatingOptions,
                                            following: false,
                                        },
                                    })
                                }
                            }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[80%] max-sm:text-xs">
                        Only allow users who follow you to book a call.
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-2 max-sm:gap-1">
                <h2 className="text-2xl font-semibold max-sm:text-lg">Customization</h2>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Font</h2>
                    <FontFamilyPicker
                        defaultValue={config.fontFamily || 'Roboto'}
                        onSelect={(font) => {
                            updateConfig({
                                fontFamily: font,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Primary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.primaryColor || '#ffffff'}
                        setBackground={(value: string) =>
                            updateConfig({
                                primaryColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Secondary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.secondaryColor || '#000000'}
                        setBackground={(value: string) =>
                            updateConfig({
                                secondaryColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Title Style</h2>
                    <FontStylePicker
                        currentFont={config?.fontFamily || 'Roboto'}
                        defaultValue={config?.titleStyle || 'normal'}
                        onSelect={(style) =>
                            updateConfig({
                                titleStyle: style,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Title Weight</h2>
                    <FontWeightPicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.titleWeight}
                        onSelect={(weight) =>
                            updateConfig({
                                titleWeight: weight,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-sm:gap-0">
                    <h2 className="text-lg font-semibold max-sm:text-base">Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.background || '#000000'}
                        setBackground={(e) =>
                            updateConfig({
                                background: e,
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
