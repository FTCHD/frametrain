'use client'
import { Tabs } from '@/sdk/components'
import type {
    AspectRatio,
    BaseImagePaths,
    ButtonConfig,
    FigmaMetadata,
    SlideConfig,
    TextLayerConfig,
    TextLayerConfigs,
} from '../Config'
import { ButtonDesigner, type ButtonTarget } from './ButtonDesigner'
import { PropertiesTab } from './PropertiesTab'
import { TextLayerDesigner } from './TextLayerDesigner'

type SlideDesignerProps = {
    figmaPAT: string
    slideConfig: SlideConfig
    buttonTargets: ButtonTarget[]
    onUpdate: (updatedSlideConfig: SlideConfig) => void
}

const SlideDesigner = ({ figmaPAT, slideConfig, buttonTargets, onUpdate }: SlideDesignerProps) => {
    function updateTitle(title: string) {
        onUpdate({ ...slideConfig, title })
    }

    function updateDescription(description: string) {
        onUpdate({ ...slideConfig, description })
    }

    function updateFigma(
        figmaUrl: string,
        figmaMetadata: FigmaMetadata,
        baseImagePaths: BaseImagePaths,
        textLayers: TextLayerConfigs
    ) {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateFigma()`)
        onUpdate({ ...slideConfig, figmaUrl, figmaMetadata, baseImagePaths, textLayers })
    }

    function updateAspectRatio(aspectRatio: AspectRatio) {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateAspectRatio()`)
        onUpdate({ ...slideConfig, aspectRatio })
    }

    function updateButton(updatedButton: ButtonConfig) {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateButton(${updatedButton.id})`)
        const updatedButtons = slideConfig.buttons.map((button) =>
            button.id === updatedButton.id ? updatedButton : button
        )
        onUpdate({ ...slideConfig, buttons: updatedButtons })
    }

    function updateTextLayer(updatedTextLayer: TextLayerConfig) {
        console.debug(`SlideDesigner[${slideConfig.id}]::updateTextLayer(${updatedTextLayer.id})`)
        const updatedTextLayers = {
            ...slideConfig.textLayers,
            [updatedTextLayer.id]: updatedTextLayer,
        }
        onUpdate({ ...slideConfig, textLayers: updatedTextLayers })
    }

    return (
        <div className="w-full space-y-2">
            <Tabs.Root defaultValue="properties" className="w-full">
                <Tabs.List className="grid w-full grid-cols-3">
                    <Tabs.Trigger value="properties">Properties</Tabs.Trigger>
                    <Tabs.Trigger value="text" disabled={!slideConfig.figmaUrl}>
                        Text Layers
                    </Tabs.Trigger>
                    <Tabs.Trigger value="buttons" disabled={!slideConfig.figmaUrl}>
                        Buttons
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="properties">
                    <PropertiesTab
                        slideConfigId={slideConfig.id}
                        title={slideConfig.title}
                        description={slideConfig.description}
                        textLayers={slideConfig.textLayers}
                        aspectRatio={slideConfig.aspectRatio}
                        figmaPAT={figmaPAT}
                        figmaUrl={slideConfig.figmaUrl}
                        figmaMetadata={slideConfig.figmaMetadata}
                        onUpdateTitle={updateTitle}
                        onUpdateDescription={updateDescription}
                        onUpdateFigma={updateFigma}
                        onUpdateAspectRatio={updateAspectRatio}
                    />
                </Tabs.Content>
                <Tabs.Content value="text">
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(slideConfig.textLayers).map((textLayer) => (
                            <TextLayerDesigner
                                key={textLayer.id}
                                config={textLayer}
                                onChange={updateTextLayer}
                            />
                        ))}
                    </div>
                </Tabs.Content>
                <Tabs.Content value="buttons">
                    <div className="grid grid-cols-[min-content_min-content_1fr_min-content_1fr] gap-4">
                        <div>
                            <p>#</p>
                        </div>
                        <div />
                        <div>Caption</div>
                        <div>Target</div>
                        <div />
                        {slideConfig.buttons.map((buttonConfig) => (
                            <ButtonDesigner
                                key={buttonConfig.id}
                                config={buttonConfig}
                                targets={buttonTargets}
                                onChange={updateButton}
                            />
                        ))}
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}

export default SlideDesigner
