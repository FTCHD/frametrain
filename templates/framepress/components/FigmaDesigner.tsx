'use client'

import { type FigmaDesign, getFigmaDesign } from '../utils/FigmaApi'
import { Input } from '@/components/shadcn/Input'
import { Button } from '@/components/shadcn/Button'
import { useState } from 'react'
import type { AspectRatio, TextLayerConfig, TextLayerConfigs } from '../Config'
import { LoaderIcon, RectangleHorizontalIcon, SquareIcon } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { Badge } from '@/components/shadcn/Badge'

type FigmaDesignerProps = {
    slideConfigId: string
    textLayers: TextLayerConfigs
    aspectRatio: AspectRatio
    figmaPAT: string
    figmaUrl?: string
    figmaDesign?: FigmaDesign
    onUpdateUrl: (figmaUrl: string, textLayers: TextLayerConfigs) => void
    onUpdateAspectRatio: (aspectRatio: AspectRatio) => void
}

export const FigmaDesigner = ({
    slideConfigId,
    textLayers,
    aspectRatio,
    figmaPAT,
    figmaUrl,
    figmaDesign,
    onUpdateUrl,
    onUpdateAspectRatio,
}: FigmaDesignerProps) => {
    const [newUrl, setNewUrl] = useState(figmaUrl)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string>('')

    const updateUrl = async () => {
        console.debug(`FigmaDesigner[${slideConfigId}]::updateFigmaUrl()`)

        setIsUpdating(true)
        setError('')

        const figmaDesign = await getFigmaDesign(figmaPAT, newUrl)
        if (!figmaDesign.success) {
            setError(figmaDesign.error)
            setIsUpdating(false)
            return
        }

        const updatedTextLayers = figmaDesign.value.textLayers
            .map((textLayer) => {
                // Don't overwrite an existing config!
                const existingConfig = textLayers[textLayer.id]

                return (
                    existingConfig ?? {
                        id: textLayer.id,
                        enabled: false,
                        fill: textLayer.fill || 'black',
                        stroke: textLayer.stroke || '',
                        fontFamily: textLayer.fontFamily || 'Roboto',
                        fontSize: textLayer.fontSize || 12,
                        fontWeight: textLayer.fontWeight || '400',
                        fontStyle: textLayer.fontStyle || 'normal',
                        letterSpacing: textLayer.letterSpacing || '',
                        style: textLayer.style || '',
                        x: textLayer.x,
                        y: textLayer.y,
                    }
                )
            })
            .reduce(
                (acc, textLayer) => {
                    acc[textLayer.id] = textLayer
                    return acc
                },
                {} as Record<string, TextLayerConfig>
            )

        // At this point, url is guaranteed valid
        onUpdateUrl(newUrl!, updatedTextLayers)

        setIsUpdating(false)
    }

    return (
        <div>
            <div className="flex items-center gap-2">
                <Input
                    type="url"
                    placeholder={
                        figmaPAT
                            ? 'Right click on a frame in Figma > Copy as > Copy link'
                            : 'Configure Figma PAT first'
                    }
                    disabled={!figmaPAT}
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                />
                <Button disabled={!figmaPAT} onClick={updateUrl}>
                    {isUpdating && <LoaderIcon className="animate-spin" />}
                    {!(isUpdating || figmaUrl) && 'Load'}
                    {!isUpdating && figmaUrl && 'Update'}
                </Button>
            </div>
            {error && <div className="flex items-center gap-2 text-red-600">{error}</div>}
            {!isUpdating && figmaDesign && (
                <div className="grid grid-cols-[1fr_1fr] gap-4 mt-4">
                    <div className="flex items-center">Width</div>
                    <div className="flex items-center">
                        <Badge>{figmaDesign?.width}</Badge>
                        <div className="text-sm ml-4 opacity-80">(1200 or 630 is recommended)</div>
                    </div>

                    <div className="flex items-center">Height</div>
                    <div className="flex items-center">
                        <Badge>{figmaDesign?.height}</Badge>
                        <div className="text-sm ml-4 opacity-80">(630 is recommended)</div>
                    </div>

                    <div className="flex items-center">True Aspect Ratio</div>
                    <div className="flex items-center">
                        <Badge>{figmaDesign?.aspectRatio?.toFixed(2)}</Badge>
                    </div>

                    <div className="flex items-center">Frame Aspect Ratio</div>
                    <div className="flex items-center">
                        <Select
                            defaultValue={aspectRatio}
                            onValueChange={(value) => onUpdateAspectRatio(value as AspectRatio)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select aspect ratio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1:1">
                                    <SquareIcon className="h-4 w-4 mr-2" />
                                    1:1 (Square)
                                </SelectItem>
                                <SelectItem value="1.91:1">
                                    <RectangleHorizontalIcon className="h-4 w-4 mr-2" />
                                    1.91:1 (Widescreen)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}

// type FigmaDesignProps = {
//     aspectRatio?: string
//     figmaDesign?: FigmaDesign
//     isLoading: boolean
// }

// const FigmaDesignSummary = ({ aspectRatio, figmaDesign, isLoading }: FigmaDesignProps) => {
//     if (isLoading) return <LoaderIcon className="animate-spin" />

//     if (figmaDesign !== undefined && aspectRatio !== undefined)
//         return (
//             <div>
//                 ✅ {figmaDesign?.width}x{figmaDesign?.height} ({aspectRatio})
//             </div>
//         )

//     if (figmaDesign !== undefined && aspectRatio === undefined)
//         return (
//             <div>
//                 ❌ width x height must be 1200x630 or 630x630, but is {figmaDesign?.width}x
//                 {figmaDesign?.height}
//             </div>
//         )

//     return <div />
// }

// const FigmaDesignPreview = ({ figmaDesign, isLoading }: FigmaDesignProps) => {
//     if (isLoading) return <LoaderIcon className="animate-spin" />

//     if (figmaDesign !== undefined) {
//         return <img src={figmaDesign.base64} alt="preview" />
//     }

//     return <div />
// }

// export { FigmaDesignSummary, FigmaDesignPreview }
