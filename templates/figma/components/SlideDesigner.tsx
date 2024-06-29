'use client'
import { Button } from '@/components/shadcn/Button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/shadcn/Card'
import { Input } from '@/components/shadcn/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/Tabs'
import { MoveDownIcon, MoveUpIcon, Trash2Icon } from 'lucide-react'
import type {
    AspectRatio,
    BaseImagePaths,
    ButtonConfig,
    FigmaMetadata,
    SlideConfig,
    TextLayerConfig,
    TextLayerConfigs,
} from '../Config'
import { FigmaView, getDimensionsForAspectRatio } from '../views/FigmaView'
import { ButtonDesigner, type ButtonTarget } from './ButtonDesigner'
import { FigmaDesigner } from './FigmaDesigner'
import { TextLayerDesigner } from './TextLayerDesigner'

type SlideDesignerProps = {
    figmaPAT: string
    isFirstSlide: boolean
    isSecondSlide: boolean
    isLastSlide: boolean
    slideConfig: SlideConfig
    buttonTargets: ButtonTarget[]
    onUpdate: (updatedSlideConfig: SlideConfig) => void
    onMoveUp: () => void
    onMoveDown: () => void
    onAddAbove: () => void
    onAddBelow: () => void
    onDelete: () => void
}

const SlideDesigner = ({
    figmaPAT,
    isFirstSlide,
    isSecondSlide,
    isLastSlide,
    slideConfig,
    buttonTargets,
    onUpdate,
    onMoveUp,
    onMoveDown,
    onAddAbove,
    onAddBelow,
    onDelete,
}: SlideDesignerProps) => {
    const updateFigma = (
        figmaUrl: string,
        figmaMetadata: FigmaMetadata,
        baseImagePaths: BaseImagePaths,
        textLayers: TextLayerConfigs
    ) => {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateFigma()`)
        onUpdate({ ...slideConfig, figmaUrl, figmaMetadata, baseImagePaths, textLayers })
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

    const slideDimensions = getDimensionsForAspectRatio(slideConfig.aspectRatio)
    const figmaPreviewScale = Math.min(
        100 / (slideDimensions?.width || 100),
        100 / (slideDimensions?.height || 100)
    )

    // These numbers were handed down through generations, don't question them
    const translateX =
        slideConfig.aspectRatio == '1.91:1' ? -48 : slideConfig.aspectRatio == '1:1' ? -42 : -50

    const bordered = slideConfig.figmaMetadata
        ? ''
        : 'border-[1px] border-dashed border-white rounded-md'

    return (
        <Card className="w-full">
            <CardHeader className="grid grid-cols-[100px_1fr] items-center gap-4">
                <div className={`select-none overflow-hidden w-[100px] h-[100px] ${bordered}`}>
                    <div
                        style={{
                            transform: `translate(${translateX}%,-42%) scale(${figmaPreviewScale})`,
                        }}
                    >
                        <FigmaView slideConfig={slideConfig} />
                    </div>
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
                        <TabsTrigger value="text" disabled={!slideConfig.figmaUrl}>
                            Text Layers
                        </TabsTrigger>
                        <TabsTrigger value="buttons" disabled={!slideConfig.figmaUrl}>
                            Buttons
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="figma">
                        <FigmaDesigner
                            slideConfigId={slideConfig.id}
                            textLayers={slideConfig.textLayers}
                            aspectRatio={slideConfig.aspectRatio}
                            figmaPAT={figmaPAT}
                            figmaUrl={slideConfig.figmaUrl}
                            figmaMetadata={slideConfig.figmaMetadata}
                            onUpdate={updateFigma}
                            onUpdateAspectRatio={updateAspectRatio}
                        />
                    </TabsContent>
                    <TabsContent value="text">
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(slideConfig.textLayers).map((textLayer) => (
                                <TextLayerDesigner
                                    key={textLayer.id}
                                    config={textLayer}
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
            <CardFooter className="grid grid-cols-5 gap-2">
                <div className="col-start-1 col-end-2">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={isFirstSlide || isSecondSlide}
                        onClick={() => {
                            onMoveUp()
                        }}
                    >
                        <MoveUpIcon />
                        Up
                    </Button>
                </div>

                <div className="col-start-2 col-end-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={isFirstSlide || isLastSlide}
                        onClick={() => {
                            onMoveDown()
                        }}
                    >
                        <MoveDownIcon />
                        Down
                    </Button>
                </div>

                <div className="col-start-3 col-end-4">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={isFirstSlide}
                        onClick={() => {
                            onAddAbove()
                        }}
                    >
                        Add Above
                    </Button>
                </div>

                <div className="col-start-4 col-end-5">
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                            onAddBelow()
                        }}
                    >
                        Add Below
                    </Button>
                </div>

                <div className="col-start-5 col-end-6">
                    <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isFirstSlide}
                        onClick={() => {
                            onDelete()
                        }}
                    >
                        <Trash2Icon />
                        Delete
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default SlideDesigner
