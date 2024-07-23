'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import { publishFrameConfig, updateFrameConfig } from '@/lib/frame'
import { previewParametersAtom } from '@/lib/store'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { InspectorContext } from '../editor/Context'
import { Button } from '../shadcn/Button'
import { ComposePreview } from './ComposePreview'

export default function ComposeEditor({
    frame,
    template,
    fid,
    castState,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
    fid: string
    castState: Record<string, any>
}) {
    const refreshPreview = useRefreshPreview(frame.id)

    const [temporaryConfig, setTemporaryConfig] = useState(frame.draftConfig)
    const [updating, setUpdating] = useState(false)
    const [, setPreviewData] = useAtom(previewParametersAtom)

    async function publishConfig() {
        setUpdating(true)
        await publishFrameConfig(frame.id)
        setUpdating(false)
    }

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
    }, 500)

    function updateConfig(props: Record<string, any>) {
        if (!props || Object.keys(props).length === 0) {
            return
        }

        const newConfig = Object.assign({}, temporaryConfig, props)

        setTemporaryConfig(newConfig)

        writeConfig(newConfig)
    }

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
        <div className="flex w-full h-full flex-col">
            {/* <div className="w-full h-[200px] bg-blue-500 p-1 "> */}
            <ComposePreview />
            {/* </div> */}
            <div className="flex flex-col w-full  pt-[225px] px-3 pb-3 bg-[#0c0c0c]">
                <InspectorContext.Provider
                    value={{
                        frameId: frame.id,
                        config: temporaryConfig as typeof template.initialConfig,
                        storage: frame.storage!,
                        update: updateConfig,
                        fid: fid,
                    }}
                >
                    <Inspector />
                </InspectorContext.Provider>
            </div>
            {/* <div className="w-full min-h-[10px] bg-transparent" /> */}
            <div className="flex flex-row justify-between items-center p-3 bg-[#0c0c0c]">
                <Button
                    // className="rounded-lg font-semibold border border-transparent bg-[#7c65c1] hover:bg-[#6944ba] text-light active:border-[#ffffff4d]  px-[0.9333rem] py-[0.4333rem] text-sm"
                    variant={'default'}
                    className="w-full"
                    onClick={async () => {
                        await publishConfig()

                        window.parent.postMessage(
                            {
                                type: 'createCast',
                                data: {
                                    cast: {
                                        parent: undefined,
                                        text: castState.text,
                                        embeds: [
                                            ...(castState.embeds || []),
                                            // only use domain to occupy less space in the cast
                                            `${process.env.NEXT_PUBLIC_DOMAIN}/f/${frame.id}`,
                                        ],
                                    },
                                },
                            },
                            '*'
                        )
                        // if (isComposeClient) {
                        // postMessage
                        // return
                        // }
                    }}
                >
                    Add to cast
                </Button>

                {updating && (
                    <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent z-20 absolute right-4 top-4" />
                )}
            </div>
        </div>
    )
}
