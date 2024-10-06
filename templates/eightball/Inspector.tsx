'use client'
import {
    BasicViewInspector,
    GatingInspector,
    Switch,
    Input,
    Label,
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    Tabs,
    Slider,
    AlertDialog,
    Separator,
} from '@/sdk/components'
import { useFrameConfig, useUploadImage, useFramePreview } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useState, useCallback } from 'react'
import type { Config, ViewConfig } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const [, setFramePreview] = useFramePreview()
    const [loading, setLoading] = useState(false)

    const updateViewConfig = useCallback(
        (viewName: 'coverConfig' | 'answerConfig') => (newConfig: Partial<ViewConfig>) => {
            updateConfig((prevConfig) => ({
                ...prevConfig,
                [viewName]: { ...prevConfig[viewName], ...newConfig },
            }))
        },
        [updateConfig]
    )

    const showSuccessMessage = useCallback((message: string) => {        
        console.log(message) // Placeholder
    }, [])

    const handleGatingUpdate = useCallback(
        (newGatingConfig: Config['gating']) => {
            updateConfig((prevConfig) => ({
                ...prevConfig,
                gating: newGatingConfig,
            }))
        },
        [updateConfig]
    )
    const handleBackgroundUpload = useCallback(
        async (base64String: string, contentType: string) => {
            setLoading(true)
            try {
                const { filePath } = await uploadImage({
                    base64String,
                    contentType,
                })
                updateConfig((prevConfig) => ({
                    ...prevConfig,
                    background: filePath,
                }))
                setLoading(false)
                return filePath
            } catch (error) {
                setLoading(false)
                console.error('Error uploading image:', error)
                return ''
            }
        },
        [uploadImage, updateConfig]
    )

    const resetConfiguration = useCallback(() => {
        showSuccessMessage('Configuration reset successfully!')
        setFramePreview({
            handler: 'initial',
            buttonIndex: 1,
            inputText: '',
        })
    }, [updateConfig, showSuccessMessage, setFramePreview])

    return (
        <Configuration.Root>
            <Configuration.Section title="Frame Configuration">
                <Tabs.Root defaultValue="general" className="w-full">
                    <Tabs.List className="grid w-full grid-cols-4">
                        <Tabs.Trigger value="general">General</Tabs.Trigger>
                        <Tabs.Trigger value="cover">Cover</Tabs.Trigger>
                        <Tabs.Trigger value="answer">Answer</Tabs.Trigger>
                        <Tabs.Trigger value="customization">Customization</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="general">
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cooldown">Cooldown (seconds):</Label>
                                <Slider
                                    id="cooldown"
                                    min={-1}
                                    max={300}
                                    step={1}
                                    value={[config.cooldown]}
                                    onValueChange={([value]) =>
                                        updateConfig((prev) => ({ ...prev, cooldown: value }))
                                    }
                                />
                                <Input
                                    type="number"
                                    value={config.cooldown}
                                    onChange={(e) =>
                                        updateConfig((prev) => ({
                                            ...prev,
                                            cooldown: Number(e.target.value) || -1,
                                        }))
                                    }
                                    min="-1"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isPublic">Public:</Label>
                                <Switch
                                    id="isPublic"
                                    checked={config.isPublic}
                                    onCheckedChange={(checked) => {
                                        updateConfig((prev) => ({ ...prev, isPublic: checked }))
                                        showSuccessMessage('Public setting updated successfully!')
                                    }}
                                />
                            </div>
                        </div>
                    </Tabs.Content>

                    <Tabs.Content value="cover">
                        <BasicViewInspector
                            name="Cover"
                            config={config.coverConfig}
                            onUpdate={updateViewConfig('coverConfig')}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="answer">
                        <BasicViewInspector
                            name="Answer"
                            config={config.answerConfig}
                            onUpdate={updateViewConfig('answerConfig')}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="customization">
                        <div className="flex flex-col gap-4 mt-4">
                            <div>
                                <Label>Font Family</Label>
                                <FontFamilyPicker
                                    defaultValue={config.fontFamily || 'Roboto'}
                                    onSelect={(font) =>
                                        updateConfig((prev) => ({ ...prev, fontFamily: font }))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Font Weight</Label>
                                <FontWeightPicker
                                    onSelect={(weight) =>
                                        updateConfig((prev) => ({ ...prev, fontWeight: weight }))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Font Style</Label>
                                <FontStylePicker
                                    defaultValue={config.fontStyle || 'normal'}
                                    onSelect={(style) =>
                                        updateConfig((prev) => ({ ...prev, fontStyle: style }))
                                    }
                                />
                            </div>
                            <Separator />
                            <div>
                                <Label>Background</Label>
                                <ColorPicker
                                    className="w-full"
                                    enabledPickers={['solid', 'gradient', 'image']}
                                    background={config.background || '#000000'}
                                    setBackground={(bg) =>
                                        updateConfig((prev) => ({ ...prev, background: bg }))
                                    }
                                    uploadBackground={handleBackgroundUpload}
                                />
                            </div>
                        </div>
                    </Tabs.Content>
                </Tabs.Root>
            </Configuration.Section>

            <Configuration.Section title="Gating">
                <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="enableGating">Enable Gating:</Label>
                    <Switch
                        id="enableGating"
                        checked={config.enableGating ?? false}
                        onCheckedChange={(checked) => {
                            updateConfig((prev) => ({ ...prev, enableGating: checked }))
                            showSuccessMessage(checked ? 'Gating enabled!' : 'Gating disabled!')
                        }}
                    />
                </div>
                {config.enableGating && (
                    <GatingInspector config={config.gating} onUpdate={handleGatingUpdate} />
                )}
            </Configuration.Section>

            <Configuration.Section title="Reset Configuration">
                <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                        <Button className="mt-4">Reset Configuration</Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                        <AlertDialog.Header>
                            <AlertDialog.Title>Are you sure?</AlertDialog.Title>
                            <AlertDialog.Description>
                                This action cannot be undone. This will reset all your configuration
                                to default values.
                            </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                            <AlertDialog.Action onClick={resetConfiguration}>
                                Reset
                            </AlertDialog.Action>
                        </AlertDialog.Footer>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            </Configuration.Section>
        </Configuration.Root>
    )
}
