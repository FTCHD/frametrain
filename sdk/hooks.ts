import { InspectorContext } from '@/components/editor/Context'
import { useContext } from 'react'
import { type DebouncedState, useDebouncedCallback } from 'use-debounce'
import { uploadImage } from './upload'
import { previewParametersAtom } from '@/lib/store'
import { useAtom } from 'jotai'

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

export function useFrameState() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameState must be used within an InspectorProvider')
    }

    return context.state
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

export function useUpdatePreview() {
	const [, setPreviewData] = useAtom(previewParametersAtom)
	
	return setPreviewData
}