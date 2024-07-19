import { Slider } from '@/components/shadcn/Slider'
import { Textarea } from '@/components/shadcn/Textarea'
import { Toggle } from '@/components/shadcn/Toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn/ToggleGroup'
import { FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { ColorPicker } from '@/sdk/components/ColorPicker'
import { FontFamilyPicker } from '@/sdk/components/FontFamilyPicker'
import {
    AlignCenterIcon,
    AlignLeftIcon,
    AlignRightIcon,
    ArrowDownFromLineIcon,
    ArrowUpFromLineIcon,
    CirclePower,
    CloudDownload,
    FoldVerticalIcon,
    Type,
} from 'lucide-react'
import React, { useState } from 'react'
import type { TextLayerConfig } from '../Config'
import type { TextAlignHorizontal, TextAlignVertical } from '../utils/FigmaApi'

type TextLayerDesignerProps = {
    config: TextLayerConfig
    onChange: (textLayer: TextLayerConfig) => void
}

const TextLayerDesigner = ({ config, onChange }: TextLayerDesignerProps) => {
    const [fontSize, setFontSize] = useState(config.fontSize)

    return (
        <React.Fragment key={config.id}>
            <div className="pb-4 mb-2">
                <div className="flex items-center mb-2 gap-x-2">
                    <Type className="border-2" />
                    <p className="font-bold border-b border-slate-500 flex-grow">{config.name}</p>
                    <Toggle
                        variant="outline"
                        className="p-1 h-8 w-8"
                        defaultPressed={config.allowFigmaUpdates}
                        onPressedChange={(pressed) => {
                            onChange({ ...config, allowFigmaUpdates: pressed })
                        }}
                    >
                        <CloudDownload className="h-6 w-6" />
                    </Toggle>
                    <Toggle
                        variant="outline"
                        className="p-1 h-8 w-8"
                        defaultPressed={config.enabled}
                        onPressedChange={(pressed) => {
                            onChange({ ...config, enabled: pressed })
                        }}
                    >
                        <CirclePower className="h-6 w-6" />
                    </Toggle>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
                    <label className="text-sm font-semibold self-center">Font</label>
                    <FontFamilyPicker
                        defaultValue={config.fontFamily}
                        onSelect={(newValue) => {
                            onChange({ ...config, fontFamily: newValue })
                        }}
                    />
                    <label className="text-sm font-semibold self-center">Size ({fontSize}px)</label>
                    <Slider
                        defaultValue={[config.fontSize]}
                        max={140}
                        step={2}
                        onValueChange={(newRange) => {
                            const newValue = newRange[0]
                            setFontSize(newValue)
                            onChange({ ...config, fontSize: newValue })
                        }}
                    />
                    <label className="text-sm font-semibold self-center">Weight</label>
                    <FontWeightPicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.fontWeight || 'normal'}
                        onSelect={(newValue) => {
                            onChange({ ...config, fontWeight: newValue })
                        }}
                    />
                    <label className="text-sm font-semibold self-center">Font Style</label>
                    <FontStylePicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.fontStyle || 'normal'}
                        onSelect={(newValue) => {
                            onChange({ ...config, fontStyle: newValue })
                        }}
                    />

                    {/* text-stroke is not currently supported by satori */}
                    {/* <label className="text-sm font-semibold self-center">Center</label>
                    <Checkbox
                        defaultChecked={config.centerHorizontally}
                        onCheckedChange={(checked) => {
                            onChange({ ...config, centerHorizontally: checked === true })
                        }}
                    /> */}
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        defaultValue={config.textAlignHorizontal}
                        onValueChange={(value) => {
                            onChange({
                                ...config,
                                textAlignHorizontal: value as TextAlignHorizontal,
                            })
                        }}
                    >
                        <ToggleGroupItem value="LEFT" aria-label="Left Align">
                            <AlignLeftIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="CENTER" aria-label="Center Align">
                            <AlignCenterIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="RIGHT" aria-label="Right Align">
                            <AlignRightIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        defaultValue={config.textAlignVertical}
                        onValueChange={(value) => {
                            onChange({ ...config, textAlignVertical: value as TextAlignVertical })
                        }}
                    >
                        <ToggleGroupItem value="TOP" aria-label="Top Align">
                            <ArrowUpFromLineIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="CENTER" aria-label="Middle Align">
                            <FoldVerticalIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="BOTTOM" aria-label="Bottom Align">
                            <ArrowDownFromLineIcon className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <label className="text-sm font-semibold self-center">Fill</label>
                    <ColorPicker
                        className="w-full col-span-1"
                        background={config.fill}
                        setBackground={(newValue) => {
                            onChange({ ...config, fill: newValue })
                        }}
                    />

                    <Textarea
                        placeholder="Text content"
                        defaultValue={config.content}
                        className="col-span-2 row-span-3"
                        onBlur={(e) => {
                            onChange({ ...config, content: e.target.value })
                        }}
                    />
                    <Textarea
                        placeholder="Additional CSS properties"
                        defaultValue={config.cssStyle}
                        className="col-span-2 row-span-3"
                        onBlur={(e) => {
                            onChange({ ...config, cssStyle: e.target.value })
                        }}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export { TextLayerDesigner }
