'use client'

import type { FrameMetadataWithImageObject } from '@/debugger/frameResultToFrameMetadata'
import { postFrame } from '@/debugger/postFrame'
import { frameResultsAtom, mockFrameOptionsAtom } from '@/debugger/store'
import type { FrameButtonMetadata } from '@/lib/farcaster'
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    Modal,
    ModalDialog,
    Sheet,
    Stack,
} from '@mui/joy'
import { useAtom } from 'jotai'
import { type ChangeEvent, type PropsWithChildren, useCallback, useState } from 'react'
import { Delete, ExternalLink, PlusCircle } from 'react-feather'

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
        <Stack height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <CircularProgress variant="solid" size="lg" />
        </Stack>
    )
}

function ValidFrame({ metadata }: { metadata: FrameMetadataWithImageObject }) {
    const [inputText, setInputText] = useState('')
    const { image, input, buttons } = metadata

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
            <Sheet
                variant="solid"
                sx={{
                    borderRadius: '12px',
                    width: '100%', //! Added
                    height: '100%', //! Added
                }}
            >
                <Stack direction={'column'} height={'100%'}>
                    <img
                        style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px 12px 0 0',
                            aspectRatio: metadata.image.aspectRatio === '1:1' ? '1' : '1.91/1',
                        }}
                        src={image.src}
                        alt="Frame"
                    />

                    <Stack
                        direction={'column'}
                        paddingY={1}
                        paddingX={2}
                        gap={1.5}
                        // bgcolor={'blue'}
                        height={'100%'}
                    >
                        {!!input && (
                            <Input
                                fullWidth={true}
                                size="lg"
                                type="text"
                                placeholder={input.text}
                                onChange={handleInputChange}
                            />
                        )}
                        <Stack direction={'row'} gap={1}>
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
                        </Stack>
                    </Stack>
                </Stack>
            </Sheet>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <ModalDialog>
                    <DialogTitle>Leaving website</DialogTitle>
                    <DialogContent>
                        If you connect your wallet and the site is malicious, you may lose funds.
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="solid"
                            onClick={() => {
                                modalFn()
                                setModalOpen(false)
                            }}
                        >
                            I understand
                        </Button>
                        <Button variant="plain" color="neutral" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
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
                fid: 0,
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
            fullWidth={true}
            onClick={handleClick}
            disabled={isLoading || action === 'mint'}
            endDecorator={<ButtonIcon action={action} />}
        >
            {children}
        </Button>
    )
}

const ButtonIcon = ({ action }: { action?: string }) => {
    switch (action) {
        case 'link':
            return <ExternalLink />
        case 'post_redirect':
            return <Delete />
        case 'mint':
            return <PlusCircle />
        default:
            return null
    }
}