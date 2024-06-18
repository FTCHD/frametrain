'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
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
import type {
    AspectRatio,
    ButtonConfig,
    SlideConfig,
    TextLayerConfig,
    TextLayerConfigs,
} from '../Config'
import { type ButtonTarget, ButtonDesigner } from './ButtonDesigner'
import { FigmaDesigner } from './FigmaDesigner'
import { TextLayerDesigner } from './TextLayerDesigner'
import { type FigmaDesign, getFigmaDesign } from '../utils/FigmaApi'
import { useEffect, useState } from 'react'
import { LoaderIcon } from 'lucide-react'

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
    const [isLoadingDesign, setIsLoadingDesign] = useState<boolean>()
    const [figmaDesign, setFigmaDesign] = useState<FigmaDesign>()

    // biome-ignore lint/correctness/useExhaustiveDependencies: causes infinite recursion
    useEffect(() => {
        const loadFigmaDesign = async () => {
            setIsLoadingDesign(true)
            const figmaDesign = await getFigmaDesign(figmaPAT, slideConfig.figmaUrl)
            if (figmaDesign.success) setFigmaDesign(figmaDesign.value)
            setIsLoadingDesign(false)
        }
        loadFigmaDesign()
    }, [])

    const updateFigmaUrl = (figmaUrl: string, textLayers: TextLayerConfigs) => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateFigma()`)
        onUpdate({ ...slideConfig, figmaUrl, textLayers })
    }

    const updateAspectRatio = (aspectRatio: AspectRatio) => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateAspectRatio()`)
        onUpdate({ ...slideConfig, aspectRatio })
    }

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

    return (
        <Card className="w-full">
            <CardHeader className="grid grid-cols-[100px_1fr] items-center gap-4">
                <div className="overflow-hidden w-[100px] h-[100px] border-[1px] border-dashed border-white rounded-md">
                    {!isLoadingDesign && figmaDesign && (
                        <img
                            src={figmaDesign?.base64}
                            alt="Preview"
                            className="justify-self-center"
                        />
                    )}
                    {isLoadingDesign && <LoaderIcon className="animate-spin" />}
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
                        <FigmaDesigner
                            slideConfigId={slideConfig.id}
                            textLayers={slideConfig.textLayers}
                            aspectRatio={slideConfig.aspectRatio}
                            figmaPAT={figmaPAT}
                            figmaUrl={slideConfig.figmaUrl}
                            figmaDesign={figmaDesign}
                            onUpdateUrl={updateFigmaUrl}
                            onUpdateAspectRatio={updateAspectRatio}
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
