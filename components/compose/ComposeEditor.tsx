'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import { publishFrameConfig, updateFrameConfig } from '@/lib/frame'
import { previewParametersAtom } from '@/lib/store'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import { useAtom } from 'jotai'
import { InfoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { InspectorContext } from '../editor/Context'
import BaseSpinner from '../shadcn/BaseSpinner'
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
        <div className="flex flex-col items-center w-full h-full">
            <ComposePreview />

            <div className="w-full p-4 dark:bg-[#201629] bg-white flex flex-col gap-4">
                <div className="w-full text-base font-medium p-4 border border-[#4c3a4e70] rounded-xl  bg-stone-100 dark:bg-[#0c0c0c]">
                    <InfoIcon className="w-5 h-5 inline-block mr-2" /> {template.description}
                </div>

                <div className="flex flex-col w-full p-3 px-4  bg-stone-100 dark:bg-[#0c0c0c] rounded-xl ">
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
            </div>

            <div className="flex flex-row justify-center items-center w-full p-2 pb-5 dark:bg-[#201629] bg-white">
                <Button
                    className="w-[50%] rounded-lg font-semibold border border-transparent bg-[#7c65c1] hover:bg-[#6944ba] active:border-[#ffffff4d] dark:text-white"
                    variant={'default'}
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
                    ADD TO CAST
                </Button>

                {updating && (
                    <div className="fixed right-6 bottom-6 z-20 p-3 rounded-full bg-secondary">
                        <BaseSpinner />
                    </div>
                )}
            </div>
        </div>
    )
}
