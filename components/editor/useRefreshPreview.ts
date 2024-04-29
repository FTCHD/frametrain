import { getPreview } from '@/lib/debugger'
import { previewHistoryAtom } from '@/lib/store'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export function useRefreshPreview() {
    const [, setResults] = useAtom(previewHistoryAtom)

    async function refreshPreview(url: string) {
        const result = await getPreview(url)
        setResults((prev) => [...prev, result])
    }

    const refreshPreviewCallback = useCallback(refreshPreview, [])

    return refreshPreviewCallback
}