'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { CloudDownload, Loader2, RectangleHorizontal, Square } from 'lucide-react'
import type { AspectRatio, FigmaMetadata, TextLayerConfig, TextLayerConfigs } from '../Config'
import { getFigmaDesign, type FigmaTextLayer } from '../utils/FigmaApi'
import { Input } from '@/components/shadcn/Input'
import { Button } from '@/components/shadcn/Button'
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
    figmaMetadata?: FigmaMetadata
    onUpdate: (figmaUrl: string, figmaMetadata: FigmaMetadata, textLayers: TextLayerConfigs) => void
    onUpdateAspectRatio: (aspectRatio: AspectRatio) => void
}

export const FigmaDesigner = ({
    slideConfigId,
    textLayers,
    aspectRatio,
    figmaPAT,
    figmaUrl,
    figmaMetadata,
    onUpdate,
    onUpdateAspectRatio,
}: FigmaDesignerProps) => {
    const [newUrl, setNewUrl] = useState(figmaUrl)
    const [isUpdating, setIsUpdating] = useState(false)

    const updateUrl = async () => {
        console.debug(`FigmaDesigner[${slideConfigId}]::updateFigmaUrl()`)

        setIsUpdating(true)

        const figmaDesignResult = await getFigmaDesign(figmaPAT, newUrl)
        if (!figmaDesignResult.success) {
            toast.error(figmaDesignResult.error)
            setIsUpdating(false)
            return
        }

        const figmaDesign = figmaDesignResult.value

        const figmaMetadata = {
            name: figmaDesign.name,
            lastModified: figmaDesign.lastModified,
            width: figmaDesign.width,
            height: figmaDesign.height,
            aspectRatio: figmaDesign.aspectRatio,
        }

        const updatedTextLayers = figmaDesign.textLayers
            .map((discoveredTextLayer) => {
                // Insert the text layer if it's a new one,
                // othewrise replace the text layer if updates are allowed
                const existingTextLayer = textLayers[discoveredTextLayer.id]
                if (!existingTextLayer || existingTextLayer.allowFigmaUpdates) {
                    return {
                        ...discoveredTextLayer,
                        allowFigmaUpdates: existingTextLayer?.allowFigmaUpdates,
                        enabled: true,
                    }
                }

                return existingTextLayer
            })
            .reduce(
                (acc, textLayer) => {
                    acc[textLayer.id] = textLayer
                    return acc
                },
                {} as Record<string, TextLayerConfig>
            )

        // At this point, url is guaranteed valid
        onUpdate(newUrl!, figmaMetadata, updatedTextLayers)

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
                <Button disabled={isUpdating || !figmaPAT} onClick={updateUrl}>
                    {isUpdating && (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                        </>
                    )}
                    {!isUpdating && (
                        <>
                            <CloudDownload className="mr-2 h-4 w-4" />
                            {figmaUrl ? 'Update' : 'Load'}
                        </>
                    )}
                </Button>
            </div>
            {!isUpdating && figmaMetadata && (
                <div className="grid grid-cols-[1fr_1fr] gap-4 mt-4">
                    <div className="flex items-center">Name</div>
                    <div className="flex items-center">{figmaMetadata?.name}</div>

                    <div className="flex items-center">Last Modified</div>
                    <div className="flex items-center">{figmaMetadata?.lastModified}</div>

                    <div className="flex items-center">Width</div>
                    <div className="flex items-center">
                        <Badge>{figmaMetadata?.width}</Badge>
                        <div className="text-xs ml-4 opacity-80">(recommendation: 1200 or 630)</div>
                    </div>

                    <div className="flex items-center">Height</div>
                    <div className="flex items-center">
                        <Badge>{figmaMetadata?.height}</Badge>
                        <div className="text-xs ml-4 opacity-80">(recommendation: 630)</div>
                    </div>

                    <div className="flex items-center">True Aspect Ratio</div>
                    <div className="flex items-center">
                        <Badge>{figmaMetadata?.aspectRatio?.toFixed(2)}</Badge>
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
                                    <Square className="h-4 w-4 mr-2" />
                                    1:1 (Square)
                                </SelectItem>
                                <SelectItem value="1.91:1">
                                    <RectangleHorizontal className="h-4 w-4 mr-2" />
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
