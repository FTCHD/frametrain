'use client'

import {
    Button,
    Chip,
    IconButton,
    Input,
    Modal,
    ModalClose,
    ModalDialog,
    Stack,
    Textarea,
    Typography,
} from '@mui/joy'
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
            <Stack width={'100%'} height={'100%'} gap={5}>
                {/* <pre>{JSON.stringify(config, null, 2)}</pre> */}
                <Stack width={'100%'} gap={2}>
                    <Typography level="h2">Cover</Typography>
                    <Stack width={'100%'} gap={1}>
                        <Typography level="title-lg">Title</Typography>
                        <Input
                            slotProps={{ input: { ref: titleInputRef } }}
                            // value={config?.title}
                            size="lg"
                            onChange={(e) => update({ title: e.target.value })}
                        />
                    </Stack>
                    <Stack width={'100%'} gap={1}>
                        <Typography level="title-lg">Profile Username</Typography>
                        <Input
                            slotProps={{ input: { ref: profileInputRef } }}
                            // value={config?.profile}
                            size="lg"
                            onChange={(e) => update({ profile: e.target.value })}
                        />
                    </Stack>
                </Stack>
                <Stack width={'100%'} gap={2}>
                    <Typography level="h2">Tweets</Typography>

                    <Stack gap={2}>
                        <Typography level="title-lg">Add Tweet</Typography>
                        <Input
                            slotProps={{ input: { ref: tweetInputRef } }}
                            type="url"
                            size="lg"
                            placeholder="https://twitter.com/username/status/..."
                            endDecorator={
                                <Button
                                    loading={loading}
                                    onClick={async () => {
                                        if (!tweetInputRef.current?.value) return

                                        if (
                                            config?.tweets?.find(
                                                (t: any) => t.link === tweetInputRef.current?.value
                                            )
                                        ) {
                                            alert('Already exists')
                                            return
                                        }

                                        setLoading(true)

                                        const tweetContent = await fetch('/api/scrape/twitter', {
                                            method: 'POST',
                                            body: tweetInputRef.current.value,
                                        })
                                            .then((res) => res.json())
                                            .catch(console.error)

                                        const newTweets = [
                                            ...(config?.tweets || []),
                                            {
                                                link: tweetInputRef.current.value,
                                                content: (tweetContent as any).content.trim(),
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
                            }
                        />
                    </Stack>

                    {tweets?.map((tweet, index) => (
                        <Stack
                            direction={'row'}
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            key={index}
                        >
                            <Stack direction={'row'} gap={1}>
                                <Chip># {index}</Chip>
                                <Typography key={index} level="body-md" variant="soft" padding={1}>
                                    {tweet.content.substring(0, 20) + '...'}
                                </Typography>
                            </Stack>
                            <Stack direction={'row'} gap={1}>
                                <Button
                                    onClick={() => {
                                        setCurrentTweet(tweet)
                                        setOpen(true)
                                    }}
                                >
                                    View
                                </Button>
                                <IconButton
                                    color="danger"
                                    onClick={() =>
                                        update({
                                            tweets: config.tweets.filter(
                                                (t: any) => t.link !== tweet.link
                                            ),
                                        })
                                    }
                                >
                                    <Trash />
                                </IconButton>
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            </Stack>

            <Modal
                open={open}
                onClose={() => {
                    alert('close')
                    setOpen(false)
                }}
            >
                <ModalDialog>
                    <ModalClose />
                    <Typography>{currentTweet.link}</Typography>
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
                </ModalDialog>
            </Modal>
        </>
    )
}
