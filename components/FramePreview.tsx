'use client'

import { type FrameMetadataWithImageObject, simulateCall } from '@/lib/debugger'
import type { FrameButtonMetadata } from '@/lib/farcaster'
import { mockOptionsAtom, previewHistoryAtom } from '@/lib/store'
import { useAtom, useAtomValue } from 'jotai'
import { type ChangeEvent, type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Delete, ExternalLink, PlusCircle } from 'react-feather'
import { BorderBeam } from './BorderBeam'
import { Button } from './shadcn/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './shadcn/Dialog'

// warpcast.com colors
const borderDefault = '#4c3a4ec0'
const borderFaint = '#4c3a4e80'
const textFaint = '#9fa3af'

export function FramePreview() {
    const [history, setHistory] = useAtom(previewHistoryAtom)

    useEffect(() => {
        // reset preview when un-mounting (= navigating to another page)
        return () => {
            setHistory([])
        }
    }, [setHistory])

    if (history.length === 0) {
        return <PlaceholderFrame />
    }

    const latestFrame = history.at(-1)

    if (!latestFrame) {
        return <PlaceholderFrame />
    }

    return <ValidFrame metadata={latestFrame.metadata} />
}

function PlaceholderFrame() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent" />
        </div>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const aspectRatioStyle =
        metadata.image.aspectRatio === '1:1' ? { aspectRatio: '1/1' } : { aspectRatio: '1.91/1' }

    const [inputText, setInputText] = useState('')
    const { image, input, buttons } = metadata

    const [loadingContainer, setLoadingContainer] = useState(false)

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

    const toggleLoadingContainer = useCallback(() => {
        setLoadingContainer((prev) => !prev)
    }, [])

    return (
        <>
            <div className="flex flex-col justify-center relative h-full bg-transparent p-[1.5px]">
                <div
                    className="relative overflow-hidden border-2 bg-[#2A2432] border-[#4c3a4e80]"
                    style={{ borderRadius: '0.48rem' }}
                >
                    <div
                        className="relative border-0 border-b cursor-pointer border-[#4c3a4e80] w-full md:w-[min(calc(100dvw-45dvw),calc(100dvh-30dvh))]"
                        style={{
                            ...aspectRatioStyle,
                            // width: 'min(calc(100dvw - 45dvw), calc(100dvh - 30dvh))',
                        }}
                    >
                        <img
                            className={'object-cover absolute inset-0 w-full h-full'}
                            src={image.src}
                            alt=""
                            style={{ ...aspectRatioStyle }}
                        />
                    </div>

                    <div className="space-y-2 rounded-lg rounded-t-none border border-t-0 px-4 py-2 border-[#4c3a4e80] bg-[#2A2432]">
                        {!!input && (
                            <div>
                                <input
                                    type="text"
                                    className="p-2 w-full text-sm rounded border bg-input text-[#fff] px-[12px] py-[10px] border-[#4c3a4e80] bg-[#17101f]"
                                    placeholder={input.text}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                        <div className="flex flex-row w-full items-center gap-[10px] ">
                            {buttons?.map((button, index) =>
                                button ? (
                                    <FrameButton
                                        inputText={inputText}
                                        key={button.label}
                                        index={index + 1}
                                        button={button}
                                        state={metadata.state}
                                        handleOpenModal={handleOpenModal}
                                        toggleContainer={toggleLoadingContainer}
                                    >
                                        {button.label}
                                    </FrameButton>
                                ) : null
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
                            variant={'destructive'}
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
    toggleContainer,
}: PropsWithChildren<{
    //! Changed from NonNullable<FrameMetadataWithImageObject['buttons']>[0]
    button: FrameButtonMetadata
    index: number
    inputText: string
    state: any
    handleOpenModal: (fn: any) => void
    toggleContainer: () => void
}>) {
    const [isLoading, setIsLoading] = useState(false)
    const [, setPreviewHistory] = useAtom(previewHistoryAtom)
    const mockOptions = useAtomValue(mockOptionsAtom)
    const { action, target } = button

    const confirmAction = useCallback(async () => {
        const fid = mockOptions.fid

        const result = await simulateCall(
            {
                untrustedData: {
                    fid,
                    url: target!,
                    messageHash: '0xDebug',
                    timestamp: 0,
                    network: 1,
                    buttonIndex: index,
                    inputText: inputText,
                    state: 'Debug',
                    castId: {
                        fid,
                        hash: '0xDebug',
                    },
                },
                trustedData: {
                    messageBytes: 'Debug',
                },
            },
            mockOptions
        )

        if (!result) return

        setPreviewHistory((prev: any) => [...prev, result])
    }, [target, index, inputText, mockOptions, setPreviewHistory])

    const handleClick = useCallback(async () => {
        if (action === 'post' || action === 'post_redirect') {
            toggleContainer()
            setIsLoading(true)
            if (action === 'post_redirect') {
                handleOpenModal(() => confirmAction)
            } else {
                await confirmAction()
            }
            toggleContainer()
            setIsLoading(false)
            return
        }

        if (action === 'link') {
            const onConfirm = () => window.open(target, '_blank')
            handleOpenModal(() => onConfirm)
        }
    }, [action, target, confirmAction, handleOpenModal, toggleContainer])

    return (
        <button
            className="rounded-lg font-normal disabled:opacity-50 border border-[#4c3a4ec0] px-4 py-2 text-sm flex h-10 flex-row items-center justify-center  bg-[#ffffff1a] hover:bg-[#ffffff1a] w-full"
            type="button"
            onClick={handleClick}
            disabled={isLoading || button?.action === 'mint'}
        >
            <span className="items-center font-normal text-white line-clamp-1">{children}</span>
            {buttonIcon({ action })}
        </button>
    )
}

const buttonIcon = ({ action }: { action?: string }) => {
    switch (action) {
        case 'link':
            return <ExternalLink size={14} color="#9fa3af" className="ml-1" />
        case 'post_redirect':
            return <Delete size={14} color="#9fa3af" className="ml-1" />
        case 'mint':
            return <PlusCircle size={14} color="#9fa3af" className="ml-1" />
        default:
            return null
    }
}
