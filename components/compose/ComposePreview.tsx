'use client'
import BaseSpinner from '@/components/shadcn/BaseSpinner'
import { Button } from '@/components/shadcn/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/Popover'
import type { FrameMetadataWithImageObject } from '@/lib/debugger'
import { previewErrorAtom, previewLoadingAtom, previewStateAtom } from '@/lib/store'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useAtomValue } from 'jotai'
import { XIcon } from 'lucide-react'
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { FramePreviewButton } from '../FramePreviewButton'

export function ComposePreview() {
    const preview = useAtomValue(previewStateAtom)
    const error = useAtomValue(previewErrorAtom)

    if (error) {
        return null
    }

    if (!preview) {
        return <PlaceholderFrame />
    }

    return <ValidFrame metadata={preview.metadata} />
}

function PlaceholderFrame() {
    return (
        <div className="flex fixed right-5 bottom-5 z-10 justify-center items-center p-4 rounded-full bg-secondary">
            <BaseSpinner />
        </div>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const [parent, toggleEnabled] = useAutoAnimate()

    const { image, input, buttons, postUrl } = metadata

    const params = useMemo(() => postUrl?.split('?')[1], [postUrl])

    const handler = useMemo(
        () => postUrl?.split(process.env.NEXT_PUBLIC_HOST!)[1].split('/').at(-1)?.split('?')[0],
        [postUrl]
    )

    const [inputText, setInputText] = useState('')

    const [isOpen, setIsOpen] = useState(false)

    const loadingContainer = useAtomValue(previewLoadingAtom)

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value),
        []
    )

    useEffect(() => {
        console.log(image)
    }, [image])

    useEffect(() => {
        toggleEnabled(!loadingContainer)
    }, [toggleEnabled, loadingContainer])

    return (
        <Popover open={isOpen}>
            <PopoverTrigger
                className="fixed bottom-5 right-5 z-[1]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className="flex overflow-hidden relative justify-center items-center p-1 w-16 h-16 rounded-full bg-secondary"
                    ref={parent}
                >
                    {loadingContainer ? (
                        <BaseSpinner />
                    ) : isOpen ? (
                        <Button variant="secondary">
                            <XIcon className="text-stone-900 dark:text-white" size={28} />
                        </Button>
                    ) : (
                        <img
                            className={'inset-0 h-full rounded-full'}
                            src={image.src}
                            alt=""
                            style={{
                                aspectRatio: image.aspectRatio?.replace(':', '/') || '1.91/1',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
            >
                <div
                    className={
                        'flex flex-col justify-center items-center z-10 fixed bottom-0 right-0 min-w-[320px] mr-2'
                    }
                    style={{
                        height: image.aspectRatio === '1:1' ? '430px' : '230px',
                    }}
                >
                    <div
                        className="relative h-[75%] overflow-hidden"
                        // overflow-hidden needed for the border-radius
                        style={{ borderRadius: '0.48rem 0.48rem 0 0' }}
                    >
                        <img
                            className={'inset-0 h-full'}
                            src={image.src}
                            alt=""
                            style={{
                                aspectRatio: image.aspectRatio?.replace(':', '/') || '1.91/1',
                            }}
                        />
                    </div>
                    <div className="py-2 rounded-lg rounded-t-none border border-t-0 px-4 border-[#4c3a4e80] bg-[#2A2432] min-h-[15%] w-full">
                        <div className="flex flex-row w-full h-full justify-center items-center gap-[10px]">
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
                                    >
                                        {button.label}
                                    </FramePreviewButton>
                                ) : undefined
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}