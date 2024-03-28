'use client'
import AccountButton from '@/components/foundation/AccountButton'
import type { frameTable } from '@/db/schema'
import { getFrameList } from '@/lib/actions'
import templates from '@/templates'
import {
    AspectRatio,
    Card,
    CardContent,
    CardOverflow,
    Chip,
    Divider,
    IconButton,
    Link,
    Stack,
    Typography,
} from '@mui/joy'
import type { InferSelectModel } from 'drizzle-orm'
import { useSession } from 'next-auth/react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { Plus } from 'react-feather'

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
            <Stack direction={'row'} justifyContent={'space-between'} paddingX={3} paddingY={2}>
                <Typography
                    level="h1"
                    sx={{ textDecoration: 'none' }}
                    component={NextLink}
                    href={'/'}
                >
                    FrameTrain
                </Typography>
                {sesh.status === 'authenticated' && <AccountButton />}
            </Stack>

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
                                        <Card
                                            key={frame.id}
                                            variant="outlined"
                                            orientation="horizontal"
                                            sx={{
                                                width: 320,
                                                '&:hover': {
                                                    boxShadow: 'md',
                                                    borderColor: 'neutral.outlinedHoverBorder',
                                                },
                                            }}
                                        >
                                            <AspectRatio ratio="1" sx={{ width: 90 }}>
                                                <NextImage
                                                    src={`data:image/svg+xml;base64,${frame.preview}`}
                                                    alt={frame.name}
                                                    fill={true}
                                                    objectFit="cover"
                                                />
                                            </AspectRatio>
                                            <CardContent
                                                sx={{
                                                    gap: 2,
                                                }}
                                            >
                                                <Link
                                                    overlay={true}
                                                    href={`/frame/${frame.id}`}
                                                    underline="none"
                                                    sx={{
                                                        color: 'text.tertiary',
                                                        textDecoration: 'none',
                                                    }}
                                                    component={NextLink}
                                                >
                                                    <Typography
                                                        level="title-lg"
                                                        id="card-description"
                                                    >
                                                        {frame.name}
                                                    </Typography>
                                                </Link>

                                                <Chip
                                                    variant="outlined"
                                                    color="primary"
                                                    size="sm"
                                                    sx={{ pointerEvents: 'none' }}
                                                >
                                                    {frame.currentMonthCalls === 0
                                                        ? 'Not used yet'
                                                        : `${frame.currentMonthCalls} calls`}
                                                </Chip>
                                            </CardContent>
                                        </Card>
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
                                {Object.keys(templates).map((id) => {
                                    const template = templates[id as keyof typeof templates] as any

                                    return (
                                        <Card variant="outlined" sx={{ width: 350 }}>
                                            <CardOverflow>
                                                <AspectRatio ratio="1.5">
                                                    <NextImage
                                                        src={template.cover}
                                                        alt={template.name}
                                                        fill={true}
                                                        objectPosition="center"
                                                    />
                                                </AspectRatio>
                                                <IconButton
                                                    size="lg"
                                                    variant="solid"
                                                    color="danger"
                                                    sx={{
                                                        position: 'absolute',
                                                        zIndex: 2,
                                                        borderRadius: '50%',
                                                        right: '1rem',
                                                        bottom: 0,
                                                        transform: 'translateY(50%)',
                                                    }}
                                                >
                                                    <Plus size={32} />
                                                </IconButton>
                                            </CardOverflow>
                                            <CardContent>
                                                <Typography level="title-lg">
                                                    {template.name}
                                                </Typography>
                                            </CardContent>
                                            <CardContent
                                                sx={{
                                                    justifyContent: 'center',
                                                    alignItems: 'start',
                                                }}
                                            >
                                                <Typography>{template.description}</Typography>
                                            </CardContent>
                                            <CardOverflow variant="soft">
                                                <Divider inset="context" />
                                                <CardContent orientation="horizontal">
                                                    <Typography level="body-xs">
                                                        Created by {template.creatorName}
                                                    </Typography>
                                                </CardContent>
                                            </CardOverflow>
                                        </Card>
                                    )
                                })}
                            </Stack>
                        </Stack>
                    </>
                )}
            </Stack>
        </Stack>
    )
}
