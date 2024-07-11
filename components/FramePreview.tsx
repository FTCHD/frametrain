'use client'

import type { FrameMetadataWithImageObject } from '@/lib/debugger'
import type { FrameButtonMetadata } from '@/lib/farcaster'
import {
    previewErrorAtom,
    previewLoadingAtom,
    previewParametersAtom,
    previewStateAtom,
} from '@/lib/store'
import { useAtom, useAtomValue } from 'jotai'
import { type ChangeEvent, type PropsWithChildren, useCallback, useMemo, useState } from 'react'
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
    const preview = useAtomValue(previewStateAtom)
    const error = useAtomValue(previewErrorAtom)

    if (error) {
        return <ErrorFrame />
    }

    if (!preview) {
        return <PlaceholderFrame />
    }

    return <ValidFrame metadata={preview.metadata} />
}

function PlaceholderFrame() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent" />
        </div>
    )
}

function ErrorFrame() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            Edit your template configuration on the rigth side.
        </div>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const { image, input, buttons, postUrl } = metadata

    const aspectRatio = useMemo(() => (image.aspectRatio || '1.91/1').replace(':', '/'), [image])

    const params = useMemo(() => metadata.postUrl?.split('?')[1], [metadata])

    const functionName = useMemo(
        () =>
            metadata.postUrl
                ?.split(process.env.NEXT_PUBLIC_HOST!)[1]
                .split('/')
                .at(-1)
                ?.split('?')[0],
        [metadata]
    )

    const [inputText, setInputText] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [modalFn, setModalFn] = useState<any>()

    const loadingContainer = useAtomValue(previewLoadingAtom)

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
            <div className="flex flex-col justify-center relative h-full bg-transparent p-[1.5px]">
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
                                    placeholder={input.text}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                        <div className="flex flex-row w-full items-center gap-[10px] ">
                            {buttons?.map((button, index) =>
                                button ? (
                                    <FrameButton
                                        key={button.label}
                                        buttonIndex={index + 1}
                                        button={button}
                                        inputText={inputText}
                                        state={metadata.state}
                                        functionName={functionName}
                                        params={params}
                                        handleOpenModal={handleOpenModal}
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
    buttonIndex,
    inputText,
    state,
    functionName,
    params,
    handleOpenModal,
}: PropsWithChildren<{
    //! Changed from NonNullable<FrameMetadataWithImageObject['buttons']>[0]
    button: FrameButtonMetadata
    buttonIndex: number
    inputText: string
    state: any
    functionName: string | undefined
    params: string | undefined
    handleOpenModal: (fn: any) => void
}>) {
    const { action, target } = button

    const [, setPreviewData] = useAtom(previewParametersAtom)
    const previewLoading = useAtomValue(previewLoadingAtom)

    const confirmAction = useCallback(async () => {
        const newData = {
            functionName: functionName,
            inputText: inputText,
            buttonIndex: buttonIndex,
            params: params,
        }

        setPreviewData(newData)
    }, [buttonIndex, inputText, functionName, params, setPreviewData])

    const handleClick = useCallback(async () => {
        if (action === 'post' || action === 'post_redirect') {
            if (action === 'post_redirect') {
                handleOpenModal(() => confirmAction)
            } else {
                await confirmAction()
            }
            return
        }

        if (action === 'link') {
            const onConfirm = () => window.open(target, '_blank')
            handleOpenModal(() => onConfirm)
        }
    }, [action, target, confirmAction, handleOpenModal])

    return (
        <button
            className="rounded-lg font-normal disabled:opacity-50 border border-[#4c3a4ec0] px-4 py-2 text-sm flex h-10 flex-row items-center justify-center  bg-[#ffffff1a] hover:bg-[#ffffff1a] w-full"
            type="button"
            onClick={handleClick}
            // disabled={previewLoading || button?.action === 'mint'}
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
