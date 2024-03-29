'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import { updateFrameConfig, updateFrameName } from '@/lib/actions'
import type templates from '@/templates'
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Input,
    Sheet,
    Stack,
    Typography,
} from '@mui/joy'
import type { InferSelectModel } from 'drizzle-orm'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Copy } from 'react-feather'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { FramePreview } from './FramePreview'
import MockOptionsToggle from './editor/MockToggle'

export default function FrameEditor({
    frame,
    template,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
}) {
    const [frameConfig, setFrameConfig] = useState(frame.config as typeof template.initialConfig)

    const [editingTitle, setEditingTitle] = useState(false)
    const [temporaryTitle, setTemporaryTitle] = useState(frame.name)

    const [updating, setUpdating] = useState(false)

    const refreshPreview = useRefreshPreview()

    async function updateConfig(props: Record<string, any>) {
        if (!frameConfig) {
            alert('No config')
            return
        }

        setUpdating(true)

        const newConfig = Object.assign({}, frameConfig, props)

        setFrameConfig(newConfig)

        await updateFrameConfig(frame.id, newConfig)

        refreshPreview(`${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`)

        setUpdating(false)
    }

    const debouncedUpdateConfig = useDebouncedCallback((value: Record<string, any>) => {
        updateConfig(value)
    }, 1000)

    async function updateName() {
        setUpdating(true)
        await updateFrameName(frame.id, temporaryTitle)
        setUpdating(false)
        setEditingTitle(false)
    }

    async function handleEnter(e: KeyboardEvent) {
        if (!editingTitle) return

        if (e.key === 'Enter') {
            e.preventDefault()
            await updateName()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleEnter)

        return () => {
            window.removeEventListener('keydown', handleEnter)
        }
    })

    useEffect(() => {
        refreshPreview(`${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`)
    }, [frame, refreshPreview])

    const { Inspector } = template as any

    return (
        <Stack width={'100%'} height={'100%'} spacing={0}>
            <Sheet variant="plain">
                <Stack
                    direction={{
                        xs: 'row',
                        md: 'row',
                    }}
                    width={'100%'}
                    minHeight={80}
                    justifyContent={'space-between'}
                    padding={2}
                    gap={{
                        xs: 2,
                        md: 0,
                    }}
                >
                    <Stack direction={'row'} gap={2}>
                        <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                            <IconButton size="lg">
                                <ArrowLeft />
                            </IconButton>
                        </NextLink>
                        {editingTitle ? (
                            <Input
                                size="lg"
                                value={temporaryTitle}
                                onChange={(e) => {
                                    setTemporaryTitle(e.target.value)
                                }}
                                variant="plain"
                                slotProps={{
                                    input: {
                                        style: {
                                            fontSize: '2.2rem',
                                            fontWeight: '700',
                                        },
                                    },
                                }}
                                sx={{
                                    '--Input-radius': '0px',
                                    borderBottom: '2px solid',
                                    borderColor: 'neutral.outlinedBorder',
                                    '&:hover': {
                                        borderColor: 'neutral.outlinedHoverBorder',
                                    },
                                    '&::before': {
                                        border: '1px solid var(--Input-focusedHighlight)',
                                        transform: 'scaleX(0)',
                                        left: 0,
                                        right: 0,
                                        bottom: '-2px',
                                        top: 'unset',
                                        transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
                                        borderRadius: 0,
                                    },
                                    '&:focus-within::before': {
                                        transform: 'scaleX(1)',
                                    },
                                }}
                            />
                        ) : (
                            <Typography
                                level="h1"
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    setEditingTitle(true)
                                }}
                            >
                                {frame.name}
                            </Typography>
                        )}
                    </Stack>
                    <Stack direction={'row'} gap={2} alignItems={'center'}>
                        {updating && <CircularProgress />}

                        <Button
                            variant="outlined"
                            size="lg"
                            endDecorator={<Copy size={18} />}
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `https://frametrain.com/f/${frame.id}`
                                )
                                toast.success('Copied to clipboard!')
                            }}
                        >
                            URL
                        </Button>
                    </Stack>
                </Stack>
            </Sheet>
            <Stack
                direction={{
                    xs: 'column',
                    lg: 'row',
                }}
                width={'100%'}
                height={'100%'}
                overflow={'hidden'}
            >
                <Stack
                    height={'100%'}
                    width={'100%'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    sx={{
                        backgroundImage: 'url(/dots.svg)',
                    }}
                    padding={10}
                    gap={5}
                >
                    {/* //! Added 100% instead of 700 */}
                    <Stack width={'100%'} height={'100%'} alignItems={'center'}>
                        <FramePreview />
                    </Stack>
                    {template.requiresValidation && <MockOptionsToggle />}
                </Stack>

                <Stack
                    width={{
                        xs: '100%',
                        lg: '40%',
                    }}
                    height={'100%'}
                    overflow="scroll"
                    paddingX={2}
                    gap={3}
                    bgcolor={'background.surface'}
                >
                    <Typography level="h1">Configuration</Typography>

                    <Box paddingBottom={10}>
                        <Inspector
                            config={frameConfig}
                            update={(value: Record<string, any>) => debouncedUpdateConfig(value)}
                        />
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    )
}

