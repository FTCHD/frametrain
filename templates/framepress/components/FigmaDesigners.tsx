'use client'

import { LoaderIcon } from 'lucide-react'
import type { FigmaDesign } from '../utils/FigmaApi'

type FigmaDesignProps = {
    aspectRatio?: string
    figmaDesign?: FigmaDesign
    isLoading: boolean
}

const FigmaDesignSummary = ({ aspectRatio, figmaDesign, isLoading }: FigmaDesignProps) => {
    if (isLoading) return <LoaderIcon className="animate-spin" />

    if (figmaDesign !== undefined && aspectRatio !== undefined)
        return (
            <div>
                ✅ {figmaDesign?.width}x{figmaDesign?.height} ({aspectRatio})
            </div>
        )

    if (figmaDesign !== undefined && aspectRatio === undefined)
        return (
            <div>
                ❌ width x height must be 1200x630 or 630x630, but is {figmaDesign?.width}x
                {figmaDesign?.height}
            </div>
        )

    return <div />
}

const FigmaDesignPreview = ({ figmaDesign, isLoading }: FigmaDesignProps) => {
    if (isLoading) return <LoaderIcon className="animate-spin" />

    if (figmaDesign !== undefined) {
        return <img src={figmaDesign.base64} alt="preview" />
    }

    return <div />
}

export { FigmaDesignSummary, FigmaDesignPreview }
