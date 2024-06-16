'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import {
    publishFrameConfig,
    revertFrameConfig,
    updateFrameConfig,
    updateFrameName,
} from '@/lib/frame'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { ImageUp, Undo2 } from 'lucide-react'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Copy } from 'react-feather'
import { toast } from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { FramePreview } from './FramePreview'
import { InspectorContext } from './editor/Context'
import MockOptions from './editor/MockOptions'
import { Button } from './shadcn/Button'
import { Input } from './shadcn/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip'

export default function FrameEditor({
    frame,
    template,
    fid,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
    fid: string
}) {
    const [editingName, setEditingName] = useState(false)
    const [temporaryName, setTemporaryName] = useState(frame.name)

    const [updating, setUpdating] = useState(false)

    const refreshPreview = useRefreshPreview()

    async function updateConfig(props: Record<string, any>) {
        if (!props || Object.keys(props).length === 0) {
            return
        }

        setUpdating(true)

        const newConfig = Object.assign({}, frame.draftConfig, props)

        await updateFrameConfig(frame.id, newConfig)

        setUpdating(false)
    }

    async function publishConfig() {
        setUpdating(true)
        await publishFrameConfig(frame.id)
        setUpdating(false)
    }

    async function revertConfig() {
        setUpdating(true)
        await revertFrameConfig(frame.id)
        setUpdating(false)
    }

    const debouncedUpdateConfig = useDebouncedCallback((value: Record<string, any>) => {
        updateConfig(value)
    }, 1000)

    async function updateName() {
        setEditingName(false)
        if (temporaryName === frame.name) return
        setUpdating(true)
        await updateFrameName(frame.id, temporaryName)
        setUpdating(false)
    }

    async function handleEnter(e: KeyboardEvent) {
        if (!editingName) return
        if (!['Enter', 'Escape'].includes(e.key)) return

        await updateName()
    }

    useEffect(() => {
        window.addEventListener('keydown', handleEnter)

        return () => {
            window.removeEventListener('keydown', handleEnter)
        }
    })

    useEffect(() => {
        refreshPreview(`${process.env.NEXT_PUBLIC_HOST}/p/${frame.id}`)
    }, [frame.draftConfig, refreshPreview, frame.id])

    const { Inspector } = template as any

    return (
        <div className="flex flex-col-reverse md:flex-col w-full h-full">
            <div className="flex justify-between items-center p-4 bg-secondary-background">
                <div className="flex gap-4 items-center">
                    <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                        <div className="p-2 hover:bg-[#636b74] rounded-md">
                            <ArrowLeft />
                        </div>
                    </NextLink>
                    {editingName ? (
                        <Input
                            value={temporaryName}
                            onChange={(e) => setTemporaryName(e.target.value)}
                            onBlur={handleEnter}
                            className="text-4xl font-bold focus:bg-transparent hover:bg-transparent"
                        />
                    ) : (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger className="hidden md:block">
                                    <h1
                                        className="text-4xl font-bold cursor-pointer"
                                        onClick={() => setEditingName(true)}
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setEditingName(true)
                                            }
                                        }}
                                    >
                                        {frame.name}
                                    </h1>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-72 ml-8">
                                    <p>Tap to edit the title, press enter to save.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="flex flex-row items-center space-x-4">
                    {updating && (
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent" />
                    )}

                    {template.requiresValidation && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild={true}>
                                    <MockOptions />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-72 flex flex-col gap-2">
                                    <p>
                                        You can use these toggles to enable or disable the
                                        simulation of an interaction.
                                    </p>
                                    <p>
                                        For example, you can simulate the user being a follower of
                                        the caster, or recasting the original cast.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button
                                    variant="outline"
                                    className="text-lg gap-2"
                                    size={'lg'}
                                    onClick={async () => {
                                        await revertConfig()
                                        toast.success('Reverted!')
                                    }}
                                >
                                    Revert <Undo2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-72 mr-8">
                                <p>Goes back to the published version.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button
                                    variant="outline"
                                    className="text-lg gap-2"
                                    size={'lg'}
                                    onClick={async () => {
                                        await publishConfig()
                                        toast.success('Published!')
                                    }}
                                >
                                    Publish <ImageUp size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-72 mr-8">
                                <p>Publishes the current changes.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button
                                    size={'lg'}
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`
                                        )
                                        toast.success('Copied to clipboard!')
                                    }}
                                    className="gap-4 px-6 py-3 bg-transparent rounded-md border border-border text-primary hover:bg-secondary-border"
                                >
                                    <span className="text-lg">URL</span> <Copy size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-72 mr-8">
                                <p>Copies the shareable Frame URL to your clipboard.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="flex flex-col md:flex-row  bg-secondary-background w-full h-full bg-[url('/dots.svg')]">
                <div className="flex flex-col justify-center items-center px-12 py-6 w-full md:w-3/5">
                    <FramePreview />
                </div>
                <div className="w-full h-full bg-[#0c0c0c] md:w-2/5 flex flex-col p-6 gap-3">
                    <h1 className="mb-4 text-4xl font-bold">Configuration</h1>

                    <div className="overflow-y-scroll max-h-[calc(100dvh-200px)]">
                        <InspectorContext.Provider
                            value={{
                                frameId: frame.id,
                                config: frame.draftConfig as typeof template.initialConfig,
                                state: frame.state!,
                                update: debouncedUpdateConfig,
                                fid: fid,
                                // setLoading
                            }}
                        >
                            <Inspector />
                        </InspectorContext.Provider>
                    </div>
                </div>
            </div>
        </div>
    )
}
