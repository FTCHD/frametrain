'use client'
import type { FrameMetadataWithImageObject } from '@/lib/debugger'
import { previewErrorAtom, previewLoadingAtom, previewStateAtom } from '@/lib/store'
import { useAtomValue } from 'jotai'
import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import { BorderBeam } from './BorderBeam'
import { FramePreviewButton } from './FramePreviewButton'
import BaseSpinner from './shadcn/BaseSpinner'

// warpcast.com colors
const borderDefault = '#4c3a4ec0'
const borderFaint = '#4c3a4e80'
const textFaint = '#9fa3af'

export function FramePreview() {
    const preview = useAtomValue(previewStateAtom)
    const error = useAtomValue(previewErrorAtom)

    if (error) {
        return <ErrorFrame />
    }

    if (!preview) {
        return <PlaceholderFrame />
    }
	
    return <ValidFrame key={preview.metadata.image.src} metadata={preview.metadata} />
}

function PlaceholderFrame() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <BaseSpinner />
        </div>
    )
}

function ErrorFrame() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            Edit your template configuration on the right side.
        </div>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const { image, input, buttons, postUrl } = metadata

    const aspectRatio = useMemo(() => (image.aspectRatio || '1.91/1').replace(':', '/'), [image])

    const params = useMemo(() => postUrl?.split('?')[1], [postUrl])

    const handler = useMemo(
        () => postUrl?.split(process.env.NEXT_PUBLIC_HOST!)[1].split('/').at(-1)?.split('?')[0],
        [postUrl]
    )

    const [inputText, setInputText] = useState('')

    const loadingContainer = useAtomValue(previewLoadingAtom)

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value),
        []
    )

    return (
        <div className="flex flex-col justify-center relative h-full  md:p-[1.5px] max-md:justify-end max-md:w-[75%]">
            <div
                className="relative overflow-hidden border-2 bg-[#2A2432] border-[#4c3a4e80]"
                style={{ borderRadius: '0.48rem' }}
            >
                <div
                    className="relative border-0 border-b cursor-pointer border-[#4c3a4e80] w-full md:w-[min(calc(100dvw-45dvw),calc(100dvh-30dvh))]"
                    style={{
                        aspectRatio,
                        // width: 'min(calc(100dvw - 45dvw), calc(100dvh - 30dvh))',
                    }}
                >
                    <img
                        className={'object-cover absolute inset-0 w-full h-full'}
                        src={image.src}
                        alt=""
                        style={{ aspectRatio }}
                    />
                </div>

                <div className="space-y-2 rounded-lg rounded-t-none border border-t-0 px-4 py-2 border-[#4c3a4e80] bg-[#2A2432]">
                    {!!input && (
                        <div>
                            <input
                                type="text"
                                className="p-2 w-full text-sm rounded border bg-input text-[#fff] px-[12px] py-[10px] border-[#4c3a4e80] bg-[#17101f]"
                                placeholder={
                                    input?.text || 'Please set a placeholder for your field.'
                                }
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="flex flex-row w-full items-center gap-[10px] ">
                        {buttons?.map((button, index) =>
                            button ? (
                                <FramePreviewButton
                                    key={button.label}
                                    buttonIndex={index + 1}
                                    button={button}
                                    inputText={inputText}
                                    state={metadata.state}
                                    handler={handler}
                                    params={params}
                                    postUrl={postUrl}
                                >
                                    {button.label}
                                </FramePreviewButton>
                            ) : undefined
                        )}
                    </div>
                </div>

                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden bg-white/30 backdrop-blur-[80px]"
                    style={{ opacity: loadingContainer ? 1 : 0 }}
                />

                <BorderBeam
                    className={`${loadingContainer ? 'visible' : 'invisible'}`}
                    colorFrom="#7c65c1"
                    colorTo="#7c65c1"
                    borderWidth={4}
                />
            </div>
        </div>
    )
}

