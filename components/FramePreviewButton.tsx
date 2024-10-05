'use client'
import type { FrameButtonMetadata } from '@/lib/farcaster'
import { mockOptionsAtom, previewLoadingAtom, previewParametersAtom } from '@/lib/store'
import { corsFetch } from '@/sdk/scrape'
import { ModalController } from '@reown/appkit-core'
import { useAtom, useAtomValue } from 'jotai'
import { type PropsWithChildren, useCallback } from 'react'
import {
    Delete as DeleteIcon,
    ExternalLink as ExternalLinkIcon,
    PlusCircle as PlusCircleIcon,
} from 'react-feather'
import toast from 'react-hot-toast'
import { useAccount, useSendTransaction } from 'wagmi'

export function FramePreviewButton({
    children,
    button,
    buttonIndex,
    inputText,
    state,
    handler,
    params,
    postUrl,
}: PropsWithChildren<{
    button: FrameButtonMetadata
    buttonIndex: number
    inputText: string
    state: any
    handler: string | undefined
    params: string | undefined
    postUrl: string | undefined
}>) {
    const [, setPreviewData] = useAtom(previewParametersAtom)
    const previewLoading = useAtomValue(previewLoadingAtom)
    const mockOptions = useAtomValue(mockOptionsAtom)
    const account = useAccount()
    const {
        data: hash,
        sendTransactionAsync
    } = useSendTransaction()

    const actionCallback = useCallback(() => {
        const newData = {
            postUrl: postUrl,
            handler: handler,
            inputText: inputText,
            buttonIndex: buttonIndex,
            params: params,
        }

        setPreviewData(newData)
    }, [buttonIndex, inputText, handler, params, postUrl, setPreviewData])

    const handleClick = useCallback(async () => {
        switch (button?.action) {
            case 'link': {
                window.open(button?.target, '_blank')
                break
            }
            case 'post': {
                actionCallback()
                break
            }
            case 'tx': {
                // if not connect
                if (account.isConnected) {
                    // get transaction
                    const tx = await getTxData(button.target as string)
                    // check chain
                    console.log(tx)
                        await sendTransactionAsync({
                            chainId: Number(tx.chainId.split(":")[1]),
                            to: tx.params.to,
                            value: tx.params.value,
                            data: tx.params.data
                        },{
                            onSettled () {
                                toast.loading("Transaction Pending")
                            },
                            onSuccess () {
                                toast.success("Transfer Successful!")
                            },
                            onError(error:any) {
                                toast.error(error.cause.shortMessage)
                            },
                        })
                } else {
                    // open reown connect modal
                    console.log(account)
                    ModalController.open()
                }
                break
            }
            default: {
                toast.error('Use the Warpcast Frames Validator to test this feature!')
                break
            }
        }
    }, [button, actionCallback])

    return (
        <button
            className="rounded-lg font-normal disabled:opacity-50 border border-[#4c3a4ec0] px-4 py-2 text-sm flex h-10 flex-row items-center justify-center bg-[#ffffff1a] hover:bg-[#ffffff1a] w-full"
            type="button"
            onClick={handleClick}
            disabled={previewLoading || button?.action === 'mint'}
        >
            <span className="items-center font-normal text-white line-clamp-1">{children}</span>
            {buttonIcon({ action: button?.action })}
        </button>
    )
}

const buttonIcon = ({ action }: { action?: string }) => {
    switch (action) {
        case 'link':
            return <ExternalLinkIcon size={14} color="#9fa3af" className="ml-1" />
        case 'post_redirect':
            return <DeleteIcon size={14} color="#9fa3af" className="ml-1" />
        case 'mint':
            return <PlusCircleIcon size={14} color="#9fa3af" className="ml-1" />
        default:
            return null
    }
}
