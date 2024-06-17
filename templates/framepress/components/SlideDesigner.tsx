'use client'

import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Checkbox } from '@/components/shadcn/Checkbox'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/shadcn/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/Tabs'

import { INITIAL_SLIDE_ID } from '../Constants'
import type { ButtonConfig, SlideConfig, TextLayerConfig } from '../Config'
import { type FigmaDesign, getFigmaDesign } from '../utils/FigmaApi'
import { type ButtonTarget, ButtonDesigner } from './ButtonDesigner'
import { FigmaDesignPreview, FigmaDesignSummary } from './FigmaDesigners'
import { TextLayerDesigner } from './TextLayerDesigner'
import { dimensionsForRatio } from '@/sdk/constants'

type SlideDesignerProps = {
    figmaPAT: string
    slideConfig: SlideConfig
    buttonTargets: ButtonTarget[]
    onUpdate: (updatedSlideConfig: SlideConfig) => void
    onAddAbove: () => void
    onAddBelow: () => void
    onDelete: () => void
}

const SlideDesigner = ({
    figmaPAT,
    slideConfig,
    buttonTargets,
    onUpdate,
    onAddAbove,
    onAddBelow,
    onDelete,
}: SlideDesignerProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const [figmaUrl, setFigmaUrl] = useState(slideConfig.figmaUrl)
    const [figmaDesign, setFigmaDesign] = useState<FigmaDesign>()

    useEffect(() => {
        const loadFigmaDesign = async () => {
            if (slideConfig.figmaUrl !== undefined) {
                setIsLoading(true)
                const figmaDesign = await getFigmaDesign(figmaPAT, slideConfig.figmaUrl)
                setFigmaDesign(figmaDesign)
                setIsLoading(false)
            }
        }
        loadFigmaDesign()
    }, [slideConfig, figmaPAT])

    const updateButton = (updatedButton: ButtonConfig) => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateButton(${updatedButton.id})`)
        const updatedButtons = slideConfig.buttons.map((button) =>
            button.id === updatedButton.id ? updatedButton : button
        )
        onUpdate({ ...slideConfig, buttons: updatedButtons })
    }

    const updateTextLayer = (updatedTextLayer: TextLayerConfig) => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateTextLayer(${updatedTextLayer.id})`)
        const updatedTextLayers = {
            ...slideConfig.textLayers,
            [updatedTextLayer.id]: updatedTextLayer,
        }
        onUpdate({ ...slideConfig, textLayers: updatedTextLayers })
    }

    const updateFigmaUrl = () => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateFigmaUrl()`)
        const loadFigmaUrl = async () => {
            setIsLoading(true)

            // TODO error handling
            const figmaDesign = await getFigmaDesign(figmaPAT, figmaUrl!)

            const aspectRatio =
                figmaDesign.width == dimensionsForRatio['1.91/1'].width &&
                figmaDesign.height == dimensionsForRatio['1.91/1'].height
                    ? '1.91:1'
                    : figmaDesign.width == dimensionsForRatio['1/1'].width &&
                        figmaDesign.height == dimensionsForRatio['1/1'].height
                      ? '1:1'
                      : undefined

            const updatedTextLayers = figmaDesign.textLayers
                .map((textLayer) => {
                    // Don't overwrite an existing config
                    const existingConfig = slideConfig.textLayers[textLayer.id]

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

            onUpdate({
                ...slideConfig,
                figmaUrl: figmaUrl,
                aspectRatio: aspectRatio,
                textLayers: updatedTextLayers,
            })

            setIsLoading(false)
        }

        if (figmaUrl !== undefined) loadFigmaUrl()
    }

    return (
        <Card className="w-full">
            <CardHeader className="grid grid-cols-[100px_1fr] items-center gap-4">
                <div className="overflow-hidden rounded-md">
                    <FigmaDesignPreview figmaDesign={figmaDesign} isLoading={isLoading} />
                </div>
                <div className="space-y-1">
                    <CardTitle>
                        <Input
                            placeholder="Title"
                            value={slideConfig.title}
                            onChange={(e) => onUpdate({ ...slideConfig, title: e.target.value })}
                        />
                    </CardTitle>
                    <CardDescription>
                        <Input
                            placeholder="Description"
                            value={slideConfig.description}
                            onChange={(e) =>
                                onUpdate({ ...slideConfig, description: e.target.value })
                            }
                        />
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="figma" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="figma">Figma</TabsTrigger>
                        <TabsTrigger value="text">Text Layers</TabsTrigger>
                        <TabsTrigger value="buttons">Buttons</TabsTrigger>
                    </TabsList>
                    <TabsContent value="figma">
                        <div className="flex items-center gap-2">
                            <Input
                                type="url"
                                placeholder="URL"
                                value={slideConfig.figmaUrl}
                                onChange={(e) => setFigmaUrl(e.target.value)}
                            />
                            <Button onClick={updateFigmaUrl}>Update</Button>
                        </div>
                        <FigmaDesignSummary
                            aspectRatio={slideConfig.aspectRatio}
                            figmaDesign={figmaDesign}
                            isLoading={isLoading}
                        />
                    </TabsContent>
                    <TabsContent value="text">
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(slideConfig.textLayers).map((textLayerConfig) => (
                                <TextLayerDesigner
                                    key={textLayerConfig.id}
                                    config={textLayerConfig}
                                    onChange={updateTextLayer}
                                />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="buttons">
                        <div className="grid grid-cols-[min-content_min-content_1fr_min-content_1fr] gap-4">
                            <div className="flex items-center font-semibold">
                                <p>#</p>
                            </div>
                            <div className="flex items-center font-semibold" />
                            <div className="flex items-center font-semibold">Caption</div>
                            <div className="flex items-center font-semibold">Target</div>
                            <div className="flex items-center font-semibold" />
                            {slideConfig.buttons.map((buttonConfig) => (
                                <ButtonDesigner
                                    key={buttonConfig.id}
                                    config={buttonConfig}
                                    targets={buttonTargets}
                                    onChange={updateButton}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-4">
                {slideConfig.id != INITIAL_SLIDE_ID && (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onAddAbove()
                        }}
                    >
                        🔼 Add slide above
                    </Button>
                )}

                <Button
                    variant="secondary"
                    onClick={() => {
                        onAddBelow()
                    }}
                >
                    🔽 Add slide below
                </Button>

                {slideConfig.id != INITIAL_SLIDE_ID && (
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onDelete()
                        }}
                    >
                        Delete
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export default SlideDesigner
