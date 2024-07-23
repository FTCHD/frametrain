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
import {
    type ChangeEvent,
    type PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { Delete, ExternalLink, PlusCircle } from 'react-feather'
import toast from 'react-hot-toast'

export function ComposePreview() {
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

    useEffect(() => {
        console.log(image)
    }, [image])

    return (
        <div className="flex flex-col h-[220px] justify-center items-center w-full p-2 fixed z-10  bg-[#202325] bg-[url('/dots.svg')]">
            <div
                className="relative h-[75%] overflow-hidden"
                // overflow-hidden needed for the border-radius
                style={{ borderRadius: '0.48rem 0.48rem 0 0' }}
            >
                <img
                    className={'inset-0 h-full'}
                    src={image.src}
                    alt=""
                    style={{ aspectRatio: '1.91/1' }}
                />
            </div>
            <div className="space-y-2 rounded-lg rounded-t-none border border-t-0 px-4 border-[#4c3a4e80] bg-[#2A2432] min-h-[25%] w-[292px]">
                <div className="flex flex-row w-full h-full justify-center items-center gap-[10px]">
                    {buttons?.map((button, index) =>
                        button ? (
                            <FrameButton
                                key={button.label}
                                buttonIndex={index + 1}
                                button={button}
                                inputText={inputText}
                                state={metadata.state}
                                handler={handler}
                                params={params}
                            >
                                {button.label}
                            </FrameButton>
                        ) : undefined
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div
            className="flex flex-col w-full h-full	bg-red-500"
            style={{ borderRadius: '0.48rem', aspectRatio: '1.91/1' }}
        >
            {/* <div
                className="relative border-0 border-b cursor-pointer border-[#4c3a4e80] w-full max-h-[50%]"
                style={{
                    aspectRatio: '1.91/1',
                }}
            > */}
            <img
                className={'object-cover inset-0 max-h-[75%]'}
                src={image.src}
                alt=""
                style={{ aspectRatio: '1.91/1' }}
            />
            {/* </div> */}

            <div className="space-y-2 rounded-lg rounded-t-none border border-t-0 px-4 py-2 border-[#4c3a4e80] bg-[#2A2432] min-h-[20%]">
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
                                handler={handler}
                                params={params}
                            >
                                {button.label}
                            </FrameButton>
                        ) : undefined
                    )}
                </div>
            </div>

            {/* <div
                className="pointer-events-none absolute inset-0 overflow-hidden bg-white/30 backdrop-blur-[80px]"
                style={{ opacity: loadingContainer ? 1 : 0 }}
            /> */}

            {/* <BorderBeam
                className={`${loadingContainer ? 'visible' : 'invisible'}`}
                colorFrom="#7c65c1"
                colorTo="#7c65c1"
                borderWidth={4}
            /> */}
        </div>
    )
}

function FrameButton({
    children,
    button,
    buttonIndex,
    inputText,
    state,
    handler,
    params,
}: PropsWithChildren<{
    //! Changed from NonNullable<FrameMetadataWithImageObject['buttons']>[0]
    button: FrameButtonMetadata
    buttonIndex: number
    inputText: string
    state: any
    handler: string | undefined
    params: string | undefined
}>) {
    const { action, target } = button

    const [, setPreviewData] = useAtom(previewParametersAtom)
    const previewLoading = useAtomValue(previewLoadingAtom)

    const actionCallback = useCallback(async () => {
        const newData = {
            handler: handler,
            inputText: inputText,
            buttonIndex: buttonIndex,
            params: params,
        }

        setPreviewData(newData)
    }, [buttonIndex, inputText, handler, params, setPreviewData])

    const handleClick = useCallback(async () => {
        switch (action) {
            case 'link': {
                window.open(target, '_blank')
                break
            }
            case 'post': {
                await actionCallback()
                break
            }
            default: {
                toast.error('Not implemented yet')
                break
            }
        }
    }, [action, target, actionCallback])

    return (
        <button
            className="rounded-lg font-normal disabled:opacity-50 border border-[#4c3a4ec0] px-4 py-2 text-sm flex h-10 flex-row items-center justify-center  bg-[#ffffff1a] hover:bg-[#ffffff1a] w-full"
            type="button"
            onClick={handleClick}
            disabled={previewLoading || button?.action === 'mint'}
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
