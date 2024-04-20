'use client'

import { ColorPicker } from '@/components/inspector/ColorPicker'
import { FontFamilyPicker } from '@/components/inspector/FontFamilyPicker'
import { FontStylePicker } from '@/components/inspector/FontStylePicker'
import { FontWeightPicker } from '@/components/inspector/FontWeightPicker'
import { Button } from '@/components/shadcn/Button'
import { Dialog, DialogContent } from '@/components/shadcn/Dialog'
import { Input } from '@/components/shadcn/Input'
import { Textarea } from '@/components/shadcn/Textarea'
import { scrapeTwitterPost } from '@/lib/scrape'
import { useEffect, useRef, useState } from 'react'
import { Trash } from 'react-feather'
import type { Config } from '.'

export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const [tweets, setTweets] = useState<Record<string, any>[]>()

    const [open, setOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const [currentTweet, setCurrentTweet] = useState<Record<string, any>>({})

    const tweetInputRef = useRef<HTMLInputElement>(null)

    const profileInputRef = useRef<HTMLInputElement>(null)
    const titleInputRef = useRef<HTMLInputElement>(null)
    const bottomTextInputRef = useRef<HTMLInputElement>(null)

    const [coverBg, setCoverBg] = useState<string>(config.background || '#0f0c29')

    const [titleTextColor, setTitleTextColor] = useState<string>(config.title?.color || 'white')
    const [bottomTextColor, setBottomTextColor] = useState<string>(config.bottom?.color || 'white')

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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setTweets(config.tweets)
    }, [config.tweets]) // might run into issues if someone updates UI too fast

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
                                update({
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
                                update({
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
                            enabledPickers={['solid']}
                            className="w-full"
                            background={titleTextColor}
                            setBackground={(value: string) => {
                                setTitleTextColor(value)
                                update({
                                    title: {
                                        ...config.title,
                                        color: value,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Title Weight</h2>
                        <FontWeightPicker
                            onSelect={(weight) =>
                                update({
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
                            defaultValue={config.title.fontStyle}
                            onSelect={(style) =>
                                update({
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
                            onChange={(e) => update({ profile: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Bottom Text</h2>
                        <Input
                            ref={bottomTextInputRef}
                            onChange={(e) =>
                                update({
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
                            enabledPickers={['solid']}
                            className="w-full"
                            background={bottomTextColor}
                            setBackground={(value: string) => {
                                setBottomTextColor(value)
                                update({
                                    bottom: {
                                        ...config.bottom,
                                        color: value,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg">Background</h2>
                        <ColorPicker
                            className="w-full"
                            background={coverBg}
                            setBackground={(e) => {
                                setCoverBg(e)
                                update({ background: e })
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

                                    update({ tweets: newTweets })

                                    setTweets(newTweets)

                                    setLoading(false)

                                    tweetInputRef.current.value = ''
                                }}
                            >
                                ADD
                            </Button>
                        </div>
                    </div>

                    {tweets?.map((tweet, index) => (
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

                                        update({ tweets: newTweets })
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

                                        update({ tweets: newTweets })
                                    }}
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <ColorPicker
                                    enabledPickers={['solid']}
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

                                        update({ tweets: newTweets })
                                    }}
                                />
                                <ColorPicker
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    className="w-20"
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

                                        update({ tweets: newTweets })
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
                                        update({
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

                            update({ tweets: newTweets })
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
