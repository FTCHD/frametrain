import { fetchFrame } from '@/debugger/getFrame'
import { frameResultsAtom } from '@/debugger/store'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export function useRefreshPreview() {
    const [, setResults] = useAtom(frameResultsAtom)

    async function refreshPreview(url: string) {
        const result = await fetchFrame(url)
        setResults((prev) => [...prev, result])
    }

    const refreshPreviewCallback = useCallback(refreshPreview, [])

    return refreshPreviewCallback
}