import { InspectorContext } from '@/components/editor/Context'
import { previewParametersAtom } from '@/lib/store'
import { useAtom } from 'jotai'
import { useCallback, useContext } from 'react'
import { type DebouncedState, useDebouncedCallback } from 'use-debounce'
import { uploadImage } from './upload'

export function useFarcasterId() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFarcasterId must be used within an InspectorProvider')
    }

    return context.fid
}

export function useFrameConfig<T>() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameConfig must be used within an InspectorProvider')
    }

    const debouncedUpdate = useDebouncedCallback((v: any) => {
        context.update(v)
    }, 500)

    return [context.config, debouncedUpdate] as [T, DebouncedState<(props: any) => void>]
}

export function useFrameId() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameId must be used within an InspectorProvider')
    }

    return context.frameId
}

export function useFrameStorage() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameStorage must be used within an InspectorProvider')
    }

    return context.storage
}

export function useUploadImage() {
    const frameId = useFrameId()

    return ({
        base64String,
        buffer,
        contentType,
    }: {
        base64String?: string | undefined
        buffer?: Buffer | undefined
        contentType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
    }) => {
        return uploadImage({ frameId, base64String, buffer, contentType })
    }
}

export function useFramePreview() {
    const [previewData, setPreviewData] = useAtom(previewParametersAtom)

    return [previewData, setPreviewData]
}

export function useResetPreview() {
    const [, setPreviewData] = useAtom(previewParametersAtom)

    const reset = useCallback(() => {
        setPreviewData(undefined)
    }, [setPreviewData])

    return reset
}