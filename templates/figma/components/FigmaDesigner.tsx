'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { CloudDownload, Loader2 } from 'lucide-react'
import type {
    AspectRatio,
    BaseImagePaths,
    FigmaMetadata,
    TextLayerConfig,
    TextLayerConfigs,
} from '../Config'
import { getFigmaDesign, svgToDataUrl } from '../utils/FigmaApi'
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
import { dimensionsForRatio } from '@/sdk/constants'
import { useFrameId, useUploadImage } from '@/sdk/hooks'

const SVG_TEXT_DEBUG_ENABLED = false

type FigmaDesignerProps = {
    slideConfigId: string
    textLayers: TextLayerConfigs
    aspectRatio: AspectRatio
    figmaPAT: string
    figmaUrl?: string
    figmaMetadata?: FigmaMetadata
    onUpdate: (
        figmaUrl: string,
        figmaMetadata: FigmaMetadata,
        baseImagePaths: BaseImagePaths,
        textLayers: TextLayerConfigs
    ) => void
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
    const frameId = useFrameId()
    const uploadImage = useUploadImage()
    const [newUrl, setNewUrl] = useState(figmaUrl)
    const [isUpdating, setIsUpdating] = useState(false)

    const updateUrl = async () => {
        console.debug(`FigmaDesigner[${slideConfigId}]::updateFigmaUrl()`)

        setIsUpdating(true)

        // Fetch the Figma design
        const figmaDesignResult = await getFigmaDesign(figmaPAT, newUrl)
        if (!figmaDesignResult.success) {
            toast.error(figmaDesignResult.error)
            setIsUpdating(false)
            return
        }

        const figmaDesign = figmaDesignResult.value

        // Extract metadata for the slide config
        const figmaMetadata = {
            name: figmaDesign.name,
            lastModified: figmaDesign.lastModified,
            width: figmaDesign.width,
            height: figmaDesign.height,
            aspectRatio: figmaDesign.aspectRatio,
        }

        // Update the text layers where configured to do so
        const updatedTextLayers = figmaDesign.textLayers
            .map((discoveredTextLayer) => {
                // Insert the text layer if it's a new one,
                // othewrise replace the text layer if updates are allowed
                const existingTextLayer = textLayers[discoveredTextLayer.id]

                // Create a new layer
                if (!existingTextLayer)
                    return {
                        ...discoveredTextLayer,
                        allowFigmaUpdates: false,
                        enabled: true,
                    }

                // Update the existing layer
                if (existingTextLayer.allowFigmaUpdates) {
                    return {
                        ...discoveredTextLayer,
                        allowFigmaUpdates: existingTextLayer.allowFigmaUpdates,
                        enabled: existingTextLayer.enabled,
                    }
                }

                // Return unaltered existing layer
                return existingTextLayer
            })
            .reduce(
                // Produce a map
                (acc, textLayer) => {
                    acc[textLayer.id] = textLayer
                    return acc
                },
                {} as Record<string, TextLayerConfig>
            )

        // Render the SVG without text elements as a performance optimization
        // We render to both target aspect ratios for simplicity
        const baseImagePaths = {
            '1:1': await renderSvg(dimensionsForRatio['1/1']),
            '1.91:1': await renderSvg(dimensionsForRatio['1.91/1']),
        }

        // At this point, newUrl is guaranteed valid
        onUpdate(newUrl!, figmaMetadata, baseImagePaths, updatedTextLayers)

        setIsUpdating(false)

        async function renderSvg({ width, height }: { width: number; height: number }) {
            const rendered = await new Promise<string>((resolve) => {
                const svg = new Image()
                svg.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx!.drawImage(svg, 0, 0, width, height)
                    const renderedData = canvas.toDataURL('image/png')
                    resolve(renderedData)
                }

                const svgXml = SVG_TEXT_DEBUG_ENABLED
                    ? figmaDesign.svgXml
                    : removeTextNodesFromSVG(figmaDesign.svgXml)

                svg.src = svgToDataUrl(svgXml)
            })

            // Upload the images to the CDN
            const data = rendered.slice('data:image/png;base64,'.length)
            const { fileName } = await uploadImage({
                base64String: data,
                contentType: 'image/png',
            })

            const path = frameId + '/' + fileName
            console.debug(`Uploaded ${width}x${height} to ${path}`)
            return path
        }

        function removeTextNodesFromSVG(svgString: string): string {
            // Create a DOM parser to parse the SVG string
            const parser = new DOMParser()
            const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')

            // Get all text elements
            const textElements = svgDoc.getElementsByTagName('text')

            // Remove each text element
            while (textElements.length > 0) {
                const textElement = textElements[0]
                textElement.parentNode?.removeChild(textElement)
            }

            // Serialize the modified SVG document back to a string
            const serializer = new XMLSerializer()
            return serializer.serializeToString(svgDoc)
        }
    }

    const aspectRatioFormatted = !figmaMetadata
        ? ''
        : figmaMetadata.aspectRatio % 1 === 0
          ? figmaMetadata?.aspectRatio?.toString() + ':1'
          : figmaMetadata?.aspectRatio?.toFixed(2) + ':1'

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
                <Button disabled={isUpdating || !figmaPAT || !newUrl} onClick={updateUrl}>
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

                    <div className="flex items-center">Source Aspect Ratio</div>
                    <div className="flex items-center">
                        <Badge>{aspectRatioFormatted}</Badge>
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
                                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                <SelectItem value="1.91:1">1.91:1 (Widescreen)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
