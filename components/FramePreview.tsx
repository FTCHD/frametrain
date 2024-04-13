'use client'

import type { FrameMetadataWithImageObject } from '@/debugger/frameResultToFrameMetadata'
import { postFrame } from '@/debugger/postFrame'
import { frameResultsAtom, mockFrameOptionsAtom } from '@/debugger/store'
import type { FrameButtonMetadata } from '@/lib/farcaster'
import { useAtom } from 'jotai'
import { type ChangeEvent, type PropsWithChildren, useCallback, useState } from 'react'
import { Delete, ExternalLink, PlusCircle } from 'react-feather'
import { Button } from './shadcn/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './shadcn/Dialog'
import { Input } from './shadcn/Input'

export function FramePreview() {
    const [results] = useAtom(frameResultsAtom)

    if (results.length === 0) {
        return <PlaceholderFrame />
    }

    const latestFrame = results[results.length - 1]

    return <ValidFrame metadata={latestFrame.metadata} />
}

function PlaceholderFrame() {
    return (
        <div className="h-full w-full flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-r-transparent animate-spin" />
        </div>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const [inputText, setInputText] = useState('')
    const { image, input, buttons } = metadata
	const imageAspectRatioClassname =
    metadata.image.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[1.91/1]'

    const [modalOpen, setModalOpen] = useState(false)
    const [modalFn, setModalFn] = useState<any>()

    const handleOpenModal = useCallback((fn: any) => {
        setModalOpen(true)
        setModalFn(fn)
    }, [])

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value),
        []
    )

    return (
        <>
            <div className="h-full w-full rounded-xl ">
                <div className="flex flex-col h-full">
                    <img
                        className={`w-full rounded-t-xl ${imageAspectRatioClassname} object-cover`}
                        src={image.src}
                        alt=""
                    />

                    <div className="flex flex-col py-1 px-2 gap-1.5 h-full">
                        {!!input && (
                            <Input
                                type="text"
                                className="border bg-primary text-primary-foreground"
                                placeholder={input.text}
                                onChange={handleInputChange}
                            />
                        )}
                        <div className="flex flex-row gap-1">
                            {buttons?.map((button, index) =>
                                button ? (
                                    <FrameButton
                                        inputText={inputText}
                                        key={button.label}
                                        index={index + 1}
                                        button={button}
                                        state={metadata.state}
                                        handleOpenModal={handleOpenModal}
                                    >
                                        {button.label}
                                    </FrameButton>
                                ) : null
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leaving website</DialogTitle>
                        <DialogDescription>
                            If you connect your wallet and the site is malicious, you may lose
                            funds.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                modalFn()
                                setModalOpen(false)
                            }}
                        >
                            I understand
                        </Button>
                        <Button color="neutral" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

function FrameButton({
    children,
    button,
    index,
    inputText,
    state,
    handleOpenModal,
}: PropsWithChildren<{
    //! Changed from NonNullable<FrameMetadataWithImageObject['buttons']>[0]
    button: FrameButtonMetadata
    index: number
    inputText: string
    state: any
    handleOpenModal: (fn: any) => void
}>) {
    const [isLoading, setIsLoading] = useState(false)
    const [_, setFrameResults] = useAtom(frameResultsAtom)
    const [mockFrameOptions] = useAtom(mockFrameOptionsAtom)
    const { action, target } = button

    const confirmAction = useCallback(async () => {
        const result = await postFrame(
            {
                buttonIndex: index,
                url: target!,
                state: JSON.stringify(state),
                // TODO: make these user-input-driven
                castId: {
                    fid: 0,
                    hash: '0xthisisnotreal',
                },
                inputText,
                fid: 123123,
                messageHash: '0xthisisnotreal',
                network: 0,
                timestamp: 0,
            } as any, //! to clear `state` error
            mockFrameOptions
        )
        // TODO: handle when result is not defined
        // build placeholder frame with error message
        setFrameResults((prev: any) => [...prev, result])
    }, [target, index, inputText, mockFrameOptions, setFrameResults, state])

    const handleClick = useCallback(async () => {
        if (action === 'post' || action === 'post_redirect') {
            // TODO: collect user options (follow, like, etc.) and include
            setIsLoading(true)
            if (action === 'post_redirect') {
                handleOpenModal(() => confirmAction)
            } else {
                confirmAction()
            }
            setIsLoading(false)
            return
        }

        if (action === 'link') {
            const onConfirm = () => window.open(target, '_blank')
            handleOpenModal(() => onConfirm)
        }

        // TODO: implement other actions (mint, etc.)
    }, [action, target, confirmAction, handleOpenModal])

    return (
        <Button
            className="border-button flex w-[45%] grow items-center justify-center gap-1 rounded-lg border bg-white px-4 py-2 text-black"
            type="button"
            onClick={handleClick}
            disabled={isLoading || button?.action === 'mint'}
        >
            <span className="block max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap">
                {children}
            </span>
            {buttonIcon({ action })}
        </Button>
    )
}

const buttonIcon = ({ action }: { action?: string }) => {
    switch (action) {
        case 'link':
            return <ExternalLink size={14} />
        case 'post_redirect':
            return <Delete size={14} />
        case 'mint':
            return <PlusCircle size={14} />
        default:
            return null
    }
}