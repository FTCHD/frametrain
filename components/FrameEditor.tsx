'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import { updateFrameConfig, updateFrameLinkedPage, updateFrameName } from '@/lib/frame'
import { previewParametersAtom } from '@/lib/store'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useAtom } from 'jotai'
import { PlayIcon, WallpaperIcon } from 'lucide-react'
import NextLink from 'next/link'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft as ArrowLeftIcon } from 'react-feather'
import { useDebouncedCallback } from 'use-debounce'
import { useOnClickOutside, useWindowSize } from 'usehooks-ts'
import { FramePreview } from './FramePreview'
import { InspectorContext } from './editor/Context'
import PublishMenu from './editor/PublishMenu'
import WebhookEventOptions from './editor/WebhookEventOptions'
import { ScrollSectionProvider } from './editor/useScrollSection'
import { Button } from './shadcn/Button'
import { Input } from './shadcn/Input'
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/Popover'
import { Toggle } from './shadcn/Toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip'
import ConnectButton from './foundation/ConnectButton'

export default function FrameEditor({
    frame,
    template,
    fid,
    fname,
    // isComposeClient,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
    fid: string
    fname: string
    // isComposeClient: boolean
}) {
    const refreshPreview = useRefreshPreview(frame.id)

    const [editingName, setEditingName] = useState(false)
    const [currentName, setCurrentName] = useState(frame.name)
    const [temporaryConfig, setTemporaryConfig] = useState(frame.draftConfig)
    const [updating, setUpdating] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(true)

    const { width } = useWindowSize()

    const [, setPreviewData] = useAtom(previewParametersAtom)

    const tempNameRef = useRef<HTMLInputElement>(null)

    const updateLinkedPage = useDebouncedCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
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
        if (width < 760) {
            setPreviewOpen(false)
        }
    }, [width])

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

    useOnClickOutside(tempNameRef, async () => await updateName())

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
        <div className="flex flex-col-reverse w-full h-full md:flex-col bg-[#0c0c0c] md:bg-[url('/dots.svg')]">
            <div className="flex justify-between items-center p-2 md:m-4 md:mb-0 md:p-3 md:rounded-2xl bg-[#0c0c0c] md:border-[#4c3a4e70] md:border ">
                <div className="flex items-center md:gap-4">
                    <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                        <div className="p-2 hover:bg-[#636b74] rounded-md">
                            <ArrowLeftIcon />
                        </div>
                    </NextLink>
                    {editingName ? (
                        <Input
                            defaultValue={currentName}
                            ref={tempNameRef}
                            onBlur={async () => {
                                await updateName()
                            }}
                            className="text-3xl font-bold max-sm:hidden focus:bg-transparent hover:bg-transparent"
                        />
                    ) : (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <h1
                                        className="text-3xl font-bold cursor-pointer max-sm:hidden"
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

                {/* TODO: consolidate this, like putting a return after postMessage to not trigger toast */}

                <div className="flex z-10 flex-row gap-3 items-center">
                    {template.events.length ? (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild={true}>
                                    <WebhookEventOptions
                                        id={frame.id}
                                        events={template.events}
                                        webhooks={Object.assign({}, frame.webhooks)}
                                        setUpdating={setUpdating}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-2 max-w-72">
                                    <p>Enable or disable the reception of webhook events.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : null}

                    <Toggle
                        size={'lg'}
                        variant={'outline'}
                        onClick={() => {
                            console.log('clicked')
                            setPreviewOpen((prev) => !prev)
                        }}
                        className="md:hidden"
                    >
                        <PlayIcon className="w-4 h-4" />
                    </Toggle>

                    <ConnectButton />

                    <Popover>
                        <PopoverTrigger asChild={true}>
                            <Button variant="outline">
                                <span className="hidden md:block">Connect Page</span>
                                <WallpaperIcon className="hidden w-4 h-4 max-md:inline" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 max-md:w-screen">
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

                    <Popover>
                        <PopoverTrigger asChild={true}>
                            <Button variant="outline">
                                <span className="hidden md:block">Earn Moxie</span>
                                <WallpaperIcon className="hidden w-4 h-4 max-md:inline" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 max-md:w-screen">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Earn Moxie</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Connect your own Airstack key to earn Moxie when other
                                        farcasters interact with your Frame!
                                    </p>
                                </div>
                                <Input
                                    id="airstackKey"
                                    type="text"
                                    placeholder="Enter your Airstack API key"
                                    defaultValue={temporaryConfig?.airstackKey || undefined}
                                    className="w-full"
                                    onChange={(e) => {
                                        updateConfig({
                                            airstackKey: e.target.value || undefined,
                                        })
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/*                  
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild={true}>
                                    <MockOptions
                                        fid={fid}
                                        // isComposeClient={isComposeClient}
                                    />
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
                        </TooltipProvider> */}

                    <PublishMenu frame={frame} />
                </div>
            </div>
            <div className="flex flex-col-reverse md:flex-row bg-secondary-background w-full h-full md:bg-[url('/dots.svg')] ">
                {previewOpen && (
                    <div className="flex flex-col justify-center items-center w-full md:px-12 md:py-6 md:w-3/5">
                        <FramePreview />
                    </div>
                )}
                <div className="p-4 pb-0 w-full h-full md:w-2/5 md:p-6">
                    <div className="h-full w-full flex flex-col gap-3 bg-[#0c0c0c] md:border-[#4c3a4e80] md:border-2 md:rounded-xl pb-2">
                        <InspectorContext.Provider
                            value={{
                                frameId: frame.id,
                                config: temporaryConfig as typeof template.initialConfig,
                                storage: frame.storage!,
                                update: updateConfig,
                                fid: fid,
                                fname: fname,
                                // setLoading
                            }}
                        >
                            <ScrollSectionProvider>
                                <Inspector />
                            </ScrollSectionProvider>
                        </InspectorContext.Provider>
                    </div>
                </div>
            </div>
        </div>
    )
}
