'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import {
    publishFrameConfig,
    revertFrameConfig,
    updateFrameConfig,
    updateFrameLinkedPage,
    updateFrameName,
} from '@/lib/frame'
import { previewParametersAtom } from '@/lib/store'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useAtom } from 'jotai'
import { ImageUp, Undo2 } from 'lucide-react'
import NextLink from 'next/link'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Copy } from 'react-feather'
import { toast } from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { FramePreview } from './FramePreview'
import { InspectorContext } from './editor/Context'
import MockOptions from './editor/MockOptions'
import { Button } from './shadcn/Button'
import { Input } from './shadcn/Input'
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/Popover'
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
    const refreshPreview = useRefreshPreview(frame.id)

    const [editingName, setEditingName] = useState(false)
    const [currentName, setCurrentName] = useState(frame.name)
    const [temporaryConfig, setTemporaryConfig] = useState(frame.draftConfig)
    const [updating, setUpdating] = useState(false)
    const [, setPreviewData] = useAtom(previewParametersAtom)

    const tempNameRef = useRef<HTMLInputElement>(null)

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

    const updateLinkedPage = useDebouncedCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        if (!url || url === '') return
        if (url && url.split('.').length < 2) return
        setUpdating(true)
        await updateFrameLinkedPage(frame.id, url)
        setUpdating(false)
    }, 1000)

    const writeConfig = useDebouncedCallback(async (props: Record<string, any>) => {
        // const props = temporaryConfig

        if (!props || Object.keys(props).length === 0) {
            return
        }

        setUpdating(true)

        const newConfig = Object.assign({}, frame.draftConfig, props)

        await updateFrameConfig(frame.id, newConfig)

        refreshPreview()

        setUpdating(false)
    }, 1000)

    function updateConfig(props: Record<string, any>) {
        if (!props || Object.keys(props).length === 0) {
            return
        }

        const newConfig = Object.assign({}, temporaryConfig, props)

        setTemporaryConfig(newConfig)

        writeConfig(newConfig)
    }

    async function updateName() {
        const temporaryName = tempNameRef.current?.value
        if (!temporaryName) return
        setCurrentName(temporaryName)
        setEditingName(false)
        if (temporaryName === frame.name) return
        setUpdating(true)
        await updateFrameName(frame.id, temporaryName)
        setUpdating(false)
    }

    useEffect(() => {
        async function handleEnter(e: KeyboardEvent) {
            if (!editingName) return
            if (!['Enter', 'Escape'].includes(e.key)) return

            await updateName()
        }

        window.addEventListener('keydown', handleEnter)

        return () => {
            window.removeEventListener('keydown', handleEnter)
        }
    })

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        setPreviewData(undefined)
    }, [])

    // prevents losing a save cycle when navigating away
    useEffect(
        () => () => {
            writeConfig.flush()
        },
        [writeConfig]
    )

    const { Inspector } = template as any

    return (
        <div className="flex flex-col-reverse w-full h-full md:flex-col">
            <div className="flex justify-between items-center p-4 bg-[#17101f]">
                <div className="flex gap-4 items-center">
                    <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                        <div className="p-2 hover:bg-[#636b74] rounded-md">
                            <ArrowLeft />
                        </div>
                    </NextLink>
                    {editingName ? (
                        <Input
                            defaultValue={currentName}
                            ref={tempNameRef}
                            onBlur={async () => {
                                await updateName()
                            }}
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
                                        {currentName}
                                    </h1>
                                </TooltipTrigger>
                                <TooltipContent className="ml-8 max-w-72">
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

                    <Popover>
                        <PopoverTrigger asChild={true}>
                            <Button
                                variant="outline"
                                className="gap-2 text-lg opacity-0 md:opacity-100"
                                size={'lg'}
                            >
                                Connect Page
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Connect your page</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Instead of the default page, FrameTrain will open your
                                        custom link when somebody clicks directly on the Frame.
                                    </p>
                                </div>
                                <Input
                                    id="urlInput"
                                    type="url"
                                    placeholder="Enter your URL here"
                                    defaultValue={frame.linkedPage || undefined}
                                    className="w-full"
                                    onChange={updateLinkedPage}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {template.requiresValidation && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild={true}>
                                    <MockOptions fid={fid} />
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-2 max-w-72">
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
                                    className="gap-2 text-lg opacity-0 md:opacity-100"
                                    size={'lg'}
                                    onClick={async () => {
                                        await revertConfig()
                                        toast.success('Reverted!')
                                    }}
                                >
                                    Revert <Undo2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="mr-8 max-w-72">
                                <p>Goes back to the published version.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild={true}>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-lg"
                                    size={'lg'}
                                    onClick={async () => {
                                        await publishConfig()
                                        toast.success('Published!')
                                    }}
                                >
                                    Publish <ImageUp size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="mr-8 max-w-72">
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
                            <TooltipContent className="mr-8 max-w-72">
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
                <div className="w-full h-full bg-[#0c0c0c] border-[#17101f] border-0 md:border-4 md:w-2/5 flex flex-col p-6 gap-3">
                    <h1 className="mb-4 text-4xl font-bold">Configuration</h1>

                    <div className="overflow-y-scroll max-h-[calc(100dvh-200px)]">
                        <InspectorContext.Provider
                            value={{
                                frameId: frame.id,
                                config: temporaryConfig as typeof template.initialConfig,
                                storage: frame.storage!,
                                update: updateConfig,
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
