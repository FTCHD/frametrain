import { parseFrameHtml, simulateCall } from '@/lib/debugger'
import {
    mockOptionsAtom,
    previewErrorAtom,
    previewLoadingAtom,
    previewParametersAtom,
    previewStateAtom,
} from '@/lib/store'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

export function useRefreshPreview(frameId: string) {
    const [, setPreviewState] = useAtom(previewStateAtom)
    const [, setPreviewError] = useAtom(previewErrorAtom)
    const [, setPreviewLoading] = useAtom(previewLoadingAtom)
    const [previewData, setPreviewData] = useAtom(previewParametersAtom)
    const mockOptions = useAtomValue(mockOptionsAtom)

    const postUrl = useMemo(() => {
        const handler = previewData?.handler || ''
        const params = previewData?.params ? `?${previewData.params}` : ''

        return `${process.env.NEXT_PUBLIC_HOST}/p/${frameId}/${handler}` + params
    }, [frameId, previewData])

    const refreshPreviewCallback = useCallback(async () => {
        try {
            setPreviewLoading(true)

            const { fid } = mockOptions

            const isPost = !!previewData

            const previewParams = isPost
                ? {
                      untrustedData: {
                          fid,
                          url: postUrl,
                          messageHash: '0xDebug',
                          timestamp: 0,
                          network: 1,
                          buttonIndex: previewData.buttonIndex,
                          inputText: previewData.inputText,
                          state: 'Debug',
                          castId: {
                              fid,
                              hash: '0xDebug',
                          },
                      },
                      trustedData: {
                          messageBytes: 'Debug',
                      },
                  }
                : undefined

            const html = await simulateCall(postUrl, previewParams, mockOptions)

            if (!html) {
                setPreviewError(true)
                setPreviewLoading(false)
                return
            }

            const result = parseFrameHtml(html)

            if (!result && !isPost) {
                setPreviewError(true)
            } else if (!result && isPost) {
                throw new Error('Frame must be reset')
            } else {
                setPreviewError(false)
                setPreviewState(result)
            }

            setPreviewLoading(false)
        } catch {
            // reset to the first (initial) slide
            setPreviewData(undefined)
        }
    }, [
        postUrl,
        previewData,
        mockOptions,
        setPreviewData,
        setPreviewState,
        setPreviewLoading,
        setPreviewError,
    ])

    useEffect(() => {
        refreshPreviewCallback()
    }, [refreshPreviewCallback])

    return refreshPreviewCallback
}
