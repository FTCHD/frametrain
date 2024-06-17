import React, { useState } from 'react'
import type { TextLayerConfig } from '../Config'
import { Textarea } from '@/components/shadcn/Textarea'
import { FontFamilyPicker } from '@/sdk/components/FontFamilyPicker'
import { ColorPicker } from '@/sdk/components/ColorPicker'
import { Slider } from '@/components/shadcn/Slider'
import { TypeIcon } from 'lucide-react'
import { FontStylePicker, FontWeightPicker } from '@/sdk/components'
import { Checkbox } from '@/components/shadcn/Checkbox'

type TextLayerDesignerProps = {
    config: TextLayerConfig
    onChange: (textLayer: TextLayerConfig) => void
}

const TextLayerDesigner = ({ config, onChange }: TextLayerDesignerProps) => {
    const [fontSize, setFontSize] = useState(config.fontSize)

    return (
        <React.Fragment key={config.id}>
            <div className="border-b pb-4 mb-2 border-slate-500">
                <div className="flex items-center mb-2">
                    <TypeIcon className="border-2" />
                    <p className="ml-2 font-bold">{config.id}</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 ml-4">
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
                        className="w-[60%]"
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
                    <label className="text-sm font-semibold self-center">Fill</label>
                    <ColorPicker
                        className="w-full col-span-1"
                        background={config.fill}
                        setBackground={(newValue) => {
                            onChange({ ...config, fill: newValue })
                        }}
                    />

                    {/* text-stroke is not currently supported by satori */}
                    <label className="text-sm font-semibold self-center">Center</label>
                    <Checkbox
                        defaultChecked={config.centerHorizontally}
                        onCheckedChange={(checked) => {
                            onChange({ ...config, centerHorizontally: checked === true })
                        }}
                    />

                    <Textarea
                        placeholder="Text content override"
                        defaultValue={config.contentOverride}
                        className="col-span-2 row-span-3"
                        onChange={(e) => {
                            onChange({ ...config, contentOverride: e.target.value })
                        }}
                    />
                    <Textarea
                        placeholder="Additional CSS properties"
                        defaultValue={config.style}
                        className="col-span-2 row-span-3"
                        onChange={(e) => {
                            onChange({ ...config, style: e.target.value })
                        }}
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export { TextLayerDesigner }
