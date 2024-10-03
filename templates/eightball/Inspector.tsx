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
    FontWeightPicker
} from '@/sdk/components'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useState } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const uploadImage = useUploadImage()
    const [loading, setLoading] = useState(false)

    const gatingConfig = config.gating || {
        enabled: [],
        requirements: {
            maxFid: 0,
            minFid: 0,
            score: 0,
            channels: [],
            exactFids: [],
            erc20: null,
            erc721: null,
            erc1155: null,
            moxie: null,
        },
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="General">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="cooldown">Cooldown (seconds):</Label>
                    <Input
                        id="cooldown"
                        type="number"
                        value={config.cooldown}
                        onChange={(e) =>
                            updateConfig({ cooldown: Number.parseInt(e.target.value) || -1 })
                        }
                        min="-1"
                    />
                </div>
                <div className="flex items-center justify-between mt-4">
                    <Label htmlFor="isPublic">Public:</Label>
                    <Switch
                        id="isPublic"
                        checked={config.isPublic}
                        onCheckedChange={(checked) => updateConfig({ isPublic: checked })}
                    />
                </div>
            </Configuration.Section>

            <Configuration.Section title="Cover">
                <BasicViewInspector
                    name="Cover"
                    config={config.coverConfig}
                    onUpdate={(newCoverConfig) => updateConfig({ coverConfig: newCoverConfig })}
                />
            </Configuration.Section>

            <Configuration.Section title="Answer">
                <BasicViewInspector
                    name="Answer"
                    config={config.answerConfig}
                    onUpdate={(newAnswerConfig) => updateConfig({ answerConfig: newAnswerConfig })}
                />
            </Configuration.Section>

            <Configuration.Section title="Customization">
                <div className="flex flex-col gap-4">
                    <div>
                        <Label>Font Family</Label>
                        <FontFamilyPicker
                            defaultValue={config.fontFamily || 'Roboto'}
                            onSelect={(font) => updateConfig({ fontFamily: font })}
                        />
                    </div>
                    <div>
                        <Label>Background Color</Label>
                        <ColorPicker
                            className="w-full"
                            enabledPickers={['solid', 'gradient', 'image']}
                            background={config.background || '#000000'}
                            setBackground={(bg) => updateConfig({ background: bg })}
                            uploadBackground={async (base64String, contentType) => {
                                const { filePath } = await uploadImage({
                                    base64String,
                                    contentType,
                                })
                                return filePath
                            }}
                        />
                    </div>
                    {/* Add more customization options as needed */}
                </div>
            </Configuration.Section>

            <Configuration.Section title="Gating">
                <div className="flex items-center justify-between">
                    <Label htmlFor="enableGating">Enable Gating:</Label>
                    <Switch
                        id="enableGating"
                        checked={config.enableGating ?? false}
                        onCheckedChange={(checked) => updateConfig({ enableGating: checked })}
                    />
                </div>
                {config.enableGating && (
                    <div className="mt-4">
                        <GatingInspector
                            config={gatingConfig}
                            onUpdate={(newGatingConfig) => updateConfig({ gating: newGatingConfig })}
                        />
                    </div>
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}