'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import { useToast } from '@/components/shadcn/use-toast'
import type { frameTable } from '@/db/schema'
import { updateFrameConfig, updateFrameName } from '@/lib/actions'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Copy } from 'react-feather'
import { useDebouncedCallback } from 'use-debounce'
import { FramePreview } from './FramePreview'
import MockOptionsToggle from './editor/MockToggle'
import { Button } from './shadcn/Button'
import { Input } from './shadcn/Input'

export default function FrameEditor({
    frame,
    template,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
}) {
    const { toast } = useToast()

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
        <div className="flex flex-col h-full w-full">
            <div className=" p-4 flex justify-between items-center bg-secondary-background">
                <div className="flex items-center gap-4">
                    <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                        <div className="p-2 hover:bg-[#636b74] rounded-md">
                            <ArrowLeft />
                        </div>
                    </NextLink>
                    {editingTitle ? (
                        <Input
                            value={temporaryTitle}
                            onChange={(e) => setTemporaryTitle(e.target.value)}
                            onKeyDown={handleEnter}
                            className="font-bold text-4xl  focus:bg-transparent hover:bg-transparent "
                        />
                    ) : (
                        <h1
                            className="text-4xl font-bold cursor-pointer  "
                            onClick={() => setEditingTitle(true)}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    setEditingTitle(true)
                                }
                            }}
                        >
                            {frame.name}
                        </h1>
                    )}
                </div>
                <div className="flex flex-row items-center space-x-4">
                    {updating && (
                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-r-transparent animate-spin " />
                    )}

                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(`https://frametra.in/f/${frame.id}`)
                            toast.success('Copied to clipboard!')
                        }}
                        className="border border-border bg-transparent text-primary hover:bg-secondary-border px-6 py-3 rounded-md gap-4"
                    >
                        <span className="text-base">URL</span> <Copy size={18} />
                    </Button>
                </div>
            </div>
            <div className="flex-1 flex bg-secondary-background w-full">
                <div className="flex flex-col items-center justify-between w-full p-10 gap-5 bg-[url('/dots.svg')]">
                    <div className="w-full h-full flex items-center justify-center">
                        <FramePreview />
                    </div>
                    {template.requiresValidation && <MockOptionsToggle />}
                </div>
                <div className="w-[40%] h-full overflow-auto p-3 overflow-y-auto">
                    <h1 className="text-4xl font-bold mb-4">Configuration</h1>
                    <div className="pb-10">
                        <Inspector
                            config={frameConfig}
                            update={(value: Record<string, any>) => debouncedUpdateConfig(value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
