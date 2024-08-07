'use client'

import { Checkbox } from '@/components/shadcn/Checkbox'
import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import React, { useState } from 'react'
import type { ButtonConfig } from '../Config'

type ButtonTarget = {
    id: string
    title: string
}

type ButtonDesignerProps = {
    config: ButtonConfig
    targets: ButtonTarget[]
    onChange: (button: ButtonConfig) => void
}

const ButtonDesigner = ({ config, targets, onChange }: ButtonDesignerProps) => {
    const [target, setTarget] = useState(config.target)

    return (
        <React.Fragment key={config.id}>
            <div className="flex items-center">
                <p>{config.id}</p>
            </div>
            <div className="flex items-center">
                <Checkbox
                    id={config.id}
                    defaultChecked={config.enabled}
                    onCheckedChange={(checked) => {
                        const newValue = checked === true
                        onChange({ ...config, enabled: newValue })
                    }}
                />
            </div>
            <div className="flex items-center">
                <Input
                    type="text"
                    placeholder="Caption"
                    defaultValue={config.caption}
                    onBlur={(e) => {
                        const newValue = e.target.value
                        onChange({ ...config, caption: newValue })
                    }}
                />
            </div>
            <div className="flex items-center">
                <Select
                    defaultValue={target}
                    onValueChange={(newValue) => {
                        setTarget(newValue)
                        onChange({ ...config, target: newValue })
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a target" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem key="URL" value="URL">
                            URL
                        </SelectItem>
                        {targets.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                                {t.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center">
                <Input
                    type="url"
                    placeholder="URL"
                    defaultValue={config.link}
                    disabled={target !== 'URL'}
                    onChange={(e) => {
                        const newValue = e.target.value
                        onChange({ ...config, link: newValue })
                    }}
                />
            </div>
        </React.Fragment>
    )
}

export { type ButtonTarget, ButtonDesigner }
