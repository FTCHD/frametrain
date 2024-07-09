import { simulateCall } from '@/lib/debugger'
import {
    mockOptionsAtom,
    previewErrorAtom,
    previewLoadingAtom,
    previewParametersAtom,
    previewStateAtom,
} from '@/lib/store'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

// export function useRefreshPreview() {
//     const [, setResults] = useAtom(previewHistoryAtom)
// 	const [, setPreviewState] = useAtom(previewStateAtom)
//     const [, setPreviewLoading] = useAtom()
//     const previewParams = useAtomValue(previewParamsAtom)
//     const previewUrl = useAtomValue(previewUrlAtom)
//     const mockOptions = useAtomValue(mockOptionsAtom)
// 	const [, setLoadingContainer] = useAtom(previewLoadingAtom)

//     const refreshPreviewCallback = useCallback(async () => {
//         try {
//             if (!previewUrl) return
//             // setPreviewLoading(true)
// 			setLoadingContainer(true)
//             const result = await simulateCall(previewUrl, previewParams, mockOptions)
//             // if (!result) {
//             //     throw new Error('No result')
//             // }
//             // setPreviewLoading(false)
//             setResults((prev) => [...prev, result])
// 			setPreviewState(result)
// 			new Promise(resolve => setTimeout(resolve, 1000)).then(() => setLoadingContainer(false))
// 			// setLoadingContainer(false)
			
//         } catch (error) {
//             toast.error('Whoops! Something went wrong.')
//             console.error('Error fetching frame:', error)
//             // throw new Error('Error fetching frame')
//         }
//     }, [previewUrl, previewParams, mockOptions, setResults, setPreviewLoading])

//     return refreshPreviewCallback
// }


export function useRefreshPreview(frameId: string) {
	const [, setPreviewState] = useAtom(previewStateAtom)
	const [, setPreviewError] = useAtom(previewErrorAtom)
	const [, setPreviewLoading] = useAtom(previewLoadingAtom)
	
    const previewData = useAtomValue(previewParametersAtom)
	const mockOptions = useAtomValue(mockOptionsAtom)
	
	const postUrl = useMemo(() => {
		const functionName = previewData?.functionName || ''
		const params = previewData?.params ? `?${previewData.params}` : ''
		
		return `${process.env.NEXT_PUBLIC_HOST}/p/${frameId}/${functionName}` + params
	}, [frameId, previewData])
	
	
	useEffect(() => {
		refreshPreviewCallback()
	}, [postUrl, mockOptions])
	

    const refreshPreviewCallback = useCallback(async () => {
        try {
			setPreviewLoading(true)
			
			const {fid} = mockOptions

			const previewParams = previewData ? {
				untrustedData: {
					fid,
					url: postUrl,
					messageHash: '0xDebug',
					timestamp: 0,
					network: 1,
					buttonIndex: previewData.buttonIndex,
					//! change 
					inputText: previewData.inputText || '',
					state: 'Debug',
					castId: {
						fid,
						hash: '0xDebug',
					},
				},
				trustedData: {
					messageBytes: 'Debug',
				},
			} : undefined
			
            const result = await simulateCall(postUrl, previewParams, mockOptions)
			
			if (!result) {
				setPreviewError(true)
			} else {
			setPreviewError(false)
				
				setPreviewState(result)
			}
		
			
			setPreviewLoading(false)
			
        } catch (error) {
            toast.error('Whoops! Something went wrong.')
            console.error('Error fetching frame:', error)
            // throw new Error('Error fetching frame')
        }
    }, [postUrl, previewData, mockOptions])

    return refreshPreviewCallback
}
