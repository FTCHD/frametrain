'use client'

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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        if (!titleInputRef.current) return
        if (titleInputRef.current.value) return
        if (!config.title) return

        titleInputRef.current.value = config.title
    }, [titleInputRef.current])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        if (!profileInputRef.current) return
        if (profileInputRef.current.value) return
        if (!config.profile) return

        profileInputRef.current.value = config.profile
    }, [profileInputRef.current])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setTweets(config.tweets)
    }, [config.tweets]) // might run into issues if someone updates UI too fast

    return (
        <>
            <div className=" flex flex-col h-full w-full space-y-4">
                {/* <pre>{JSON.stringify(config, null, 2)}</pre> */}
                <div className="flex flex-col space-y-2 w-full">
                    <h2 className="text-2xl font-bold">Cover</h2>
                    <div className="flex flex-col gap-1 w-full">
                        <h2 className="text-lg font-bold">Title</h2>
                        <Input
                            ref={titleInputRef}
                            // value={config?.title}

                            onChange={(e) => update({ title: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <h2 className="text-lg font-bold">Profile Username</h2>
                        <Input
                            ref={profileInputRef}
                            // value={config?.profile}
                            onChange={(e) => update({ profile: e.target.value })}
                        />
                    </div>
                </div>
                <div className="w-full space-y-4">
                    <h2 className="text-2xl font-bold">Tweets</h2>

                    <div className="flex flex-col space-y-2">
                        <h2 className="text-lg font-bold">Add Tweet</h2>
                        <div className="flex items-center">
                            <Input
                                ref={tweetInputRef}
                                type="url"
                                placeholder="https://twitter.com/username/status/..."
                            />
                            <Button
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
                        <div className="flex justify-between items-center" key={tweet.link}>
                            <div className="flex flex-row space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary">
                                    # {index}
                                </span>
                                <h2 className="text-md p-1">
                                    {tweet.content.substring(0, 20) + '...'}
                                </h2>
                            </div>
                            <div className="fle flex-row  p-1">
                                <Button
                                    onClick={() => {
                                        setCurrentTweet(tweet)
                                        setOpen(true)
                                    }}
                                >
                                    View
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
                            const newTweets = config?.tweets?.map((tweet: any, i) =>
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
