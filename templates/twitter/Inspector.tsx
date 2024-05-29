'use client'

import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import { Textarea } from '@/components/shadcn/Textarea'
import { ColorPicker, FontFamilyPicker, FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { scrapeTwitterPost } from '@/sdk/scrape'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Trash } from 'react-feather'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()

    const [open, setOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const [currentTweet, setCurrentTweet] = useState<Record<string, any>>({})

    const tweetInputRef = useRef<HTMLInputElement>(null)

    const profileInputRef = useRef<HTMLInputElement>(null)
    const titleInputRef = useRef<HTMLInputElement>(null)
    const bottomTextInputRef = useRef<HTMLInputElement>(null)

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        if (!titleInputRef.current) return
        if (titleInputRef.current.value) return
        if (!config.title?.text) return

        titleInputRef.current.value = config.title.text
    }, [titleInputRef.current])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        if (!profileInputRef.current) return
        if (profileInputRef.current.value) return
        if (!config.profile) return

        profileInputRef.current.value = config.profile
    }, [profileInputRef.current])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        if (!bottomTextInputRef.current) return
        if (bottomTextInputRef.current.value) return
        if (!config.bottom?.text) return

        bottomTextInputRef.current.value = config.bottom.text
    }, [bottomTextInputRef.current])

    return (
        <>
            <div className="flex flex-col gap-5 w-full h-full">
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-2xl font-bold">Cover</h2>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Text</h2>
                        <Input
                            ref={titleInputRef}
                            onChange={(e) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        text: e.target.value,
                                    },
                                })
                            }
                            size={70}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Font</h2>
                        <FontFamilyPicker
                            onSelect={(font) => {
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        fontFamily: font,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={config.title?.color || 'white'}
                            setBackground={(value: string) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        color: value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Weight</h2>
                        <FontWeightPicker
                            currentFont={config?.title?.fontFamily || 'Roboto'}
                            defaultValue={config?.title?.fontFamily}
                            onSelect={(weight) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        fontWeight: weight,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Style</h2>

                        <FontStylePicker
                            currentFont={config?.title?.fontFamily || 'Roboto'}
                            defaultValue={config?.title?.fontStyle || 'normal'}
                            onSelect={(style) =>
                                updateConfig({
                                    title: {
                                        ...config.title,
                                        fontStyle: style,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Bottom Handle</h2>
                        <Input
                            placeholder="No @ or https:// prefix"
                            ref={profileInputRef}
                            onChange={(e) => updateConfig({ profile: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Bottom Text</h2>
                        <Input
                            ref={bottomTextInputRef}
                            onChange={(e) =>
                                updateConfig({
                                    bottom: {
                                        ...config.bottom,
                                        text: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Bottom Text Color</h2>
                        <ColorPicker
                            className="w-full"
                            background={config.bottom?.color || 'white'}
                            setBackground={(value: string) =>
                                updateConfig({
                                    bottom: {
                                        ...config.bottom,
                                        color: value,
                                    },
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Background</h2>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient', 'image']}
                            background={config.background || '#0f0c29'}
                            setBackground={(e) => updateConfig({ background: e })}
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
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="text-2xl font-bold">Tweets</h2>

                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Add Tweet</h2>
                        <div className="flex gap-5 items-center">
                            <Input
                                ref={tweetInputRef}
                                type="url"
                                placeholder="https://twitter.com/username/status/..."
                            />
                            <Button
                                size={'lg'}
                                disabled={loading}
                                onClick={async () => {
                                    if (!tweetInputRef.current?.value) return

                                    setLoading(true)

                                    const tweetId = tweetInputRef.current.value
                                        .split('/')
                                        .pop()
                                        ?.split('?')[0]

                                    if (!tweetId) {
                                        setLoading(false)
                                        return
                                    }

                                    const tweet = await scrapeTwitterPost(tweetId)

                                    const newTweets = [
                                        ...(config?.tweets || []),
                                        {
                                            link: tweetInputRef.current.value,
                                            content: tweet.fullText,
                                        },
                                    ]

                                    updateConfig({ tweets: newTweets })

                                    setLoading(false)

                                    tweetInputRef.current.value = ''
                                }}
                            >
                                {loading ? <LoaderIcon className="animate-spin" /> : 'ADD'}
                            </Button>
                        </div>
                    </div>

                    {config.tweets?.map((tweet, index) => (
                        <div
                            className="flex flex-row gap-2 justify-between items-center w-full h-full"
                            key={tweet.link}
                        >
                            <div className="flex flex-row gap-2 justify-center items-center h-full">
                                <span className="flex flex-col justify-center items-center font-bold text-black bg-white rounded-full min-w-12 min-h-12">
                                    # {index}
                                </span>
                                {/* <span className="text-md">
                                    {tweet.content.substring(0, 25) + '...'}
                                </span> */}

                                <Input
                                    defaultValue={tweet.fontSize || '14px'}
                                    onChange={(e) => {
                                        const newTweets = config?.tweets?.map((t: any) =>
                                            t.link === tweet.link
                                                ? {
                                                      ...t,
                                                      fontSize: e.target.value,
                                                  }
                                                : t
                                        )

                                        updateConfig({ tweets: newTweets })
                                    }}
                                />

                                <FontFamilyPicker
                                    defaultValue={tweet.fontFamily}
                                    onSelect={(font) => {
                                        const newTweets = config?.tweets?.map((t: any) =>
                                            t.link === tweet.link
                                                ? {
                                                      ...t,
                                                      fontFamily: font,
                                                  }
                                                : t
                                        )

                                        updateConfig({ tweets: newTweets })
                                    }}
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <ColorPicker
                                    className="w-20"
                                    background={tweet.color || 'white'}
                                    setBackground={(value: string) => {
                                        const newTweets = config?.tweets?.map((t: any) =>
                                            t.link === tweet.link
                                                ? {
                                                      ...t,
                                                      color: value,
                                                  }
                                                : t
                                        )

                                        updateConfig({ tweets: newTweets })
                                    }}
                                />
                                <ColorPicker
                                    className="w-20"
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    background={tweet.background || '#0f0c29'}
                                    setBackground={(value: string) => {
                                        const newTweets = config?.tweets?.map((t: any) =>
                                            t.link === tweet.link
                                                ? {
                                                      ...t,
                                                      background: value,
                                                  }
                                                : t
                                        )

                                        updateConfig({ tweets: newTweets })
                                    }}
                                    uploadBackground={async (base64String, contentType) => {
                                        const { filePath } = await uploadImage({
                                            base64String: base64String,
                                            contentType: contentType,
                                        })

                                        return filePath
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        setCurrentTweet(tweet)
                                        setOpen(true)
                                    }}
                                >
                                    EDIT
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        updateConfig({
                                            tweets: config.tweets.filter(
                                                (t: any) => t.link !== tweet.link
                                            ),
                                        })
                                    }
                                >
                                    <Trash />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <h2 className="text-lg">{currentTweet.link}</h2>
                    <Textarea
                        onChange={(e) => {
                            setCurrentTweet({
                                ...currentTweet,
                                content: e.target.value,
                            })
                        }}
                        value={currentTweet.content}
                    />
                    <Button
                        onClick={() => {
                            const newTweets = config?.tweets?.map((tweet: any) =>
                                tweet.link === currentTweet.link ? currentTweet : tweet
                            )

                            updateConfig({ tweets: newTweets })
                            setOpen(false)
                        }}
                    >
                        Save
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}
