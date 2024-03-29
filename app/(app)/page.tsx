'use client'
import AccountButton from '@/components/foundation/AccountButton'
import Header from '@/components/foundation/Header'
import ProjectCard from '@/components/home/ProjectCard'
import TemplateCard from '@/components/home/TemplateCard'
import type { frameTable } from '@/db/schema'
import { getFrameList } from '@/lib/actions'
import templates from '@/templates'
import { Stack, Typography } from '@mui/joy'
import type { InferSelectModel } from 'drizzle-orm'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const runtime = 'edge'

export default function Home() {
    const sesh = useSession()

    const [frames, setFrames] = useState<InferSelectModel<typeof frameTable>[]>([])

    useEffect(() => {
        if (!sesh || sesh.status !== 'authenticated') {
            return
        }

        async function loadFrames() {
            const frames = await getFrameList()
            setFrames(frames)
        }

        loadFrames()
    }, [sesh])

    return (
        <Stack height={'100%'} width={'100%'}>
            <Header />

            <Stack
                gap={5}
                padding={10}
                justifyContent={'space-between'}
                height={'100%'}
                width={'100%'}
            >
                {sesh.status !== 'authenticated' ? (
                    <Stack
                        gap={2}
                        width={'100%'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        textAlign={'center'}
                    >
                        <Typography level="h1" fontSize={'3rem'}>
                            Welcome to Frametrain!
                        </Typography>
                        <Typography level="body-lg">
                            Sign in with Farcaster to get started.
                        </Typography>
                        <AccountButton />
                    </Stack>
                ) : (
                    <>
                        <Stack gap={2}>
                            <Typography level="h1">🖼️ Frames</Typography>

                            {frames.length ? (
                                <Stack
                                    direction={{
                                        xs: 'column',
                                        lg: 'row',
                                    }}
                                    gap={2}
                                >
                                    {frames.map((frame) => (
                                        <ProjectCard key={frame.id} frame={frame as any} />
                                    ))}
                                </Stack>
                            ) : (
                                <Typography level="h4">
                                    No frames yet.
                                    <br /> <br />
                                    Check out the templates below and create your first one!
                                </Typography>
                            )}
                        </Stack>

                        <Stack gap={2}>
                            <Typography level="h1">💎 Templates</Typography>
                            <Stack
                                direction={{
                                    xs: 'column',
                                    lg: 'row',
                                }}
                                gap={2}
                            >
                                {Object.keys(templates).map((id) => (
                                    <TemplateCard
                                        key={id}
                                        template={templates[id as keyof typeof templates] as any}
                                        id={id}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </>
                )}
            </Stack>
        </Stack>
    )
}
