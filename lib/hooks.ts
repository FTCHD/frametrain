import { InspectorContext } from '@/components/editor/Context'
import { useContext } from 'react'

export function useFrameConfig<T>() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameConfig must be used within an InspectorProvider')
    }

    return [context.config, context.update] as [T, (props: any) => void]
}

export function useFrameId() {
    const context = useContext(InspectorContext)

    if (!context) {
        throw new Error('useFrameId must be used within an InspectorProvider')
    }

    return context.frameId
}