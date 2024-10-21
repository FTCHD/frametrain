'use client'
import { Input } from '@/components/shadcn/Input'
import { Slider } from '@/components/shadcn/Slider'
import { Select } from '@/sdk/components/Select'
import { type ReactNode, useState } from 'react'
import toast from 'react-hot-toast'
import { useUploadImage } from '../hooks'
import type { BasicViewProps, BasicViewStyle } from '../views/BasicView'
import { ColorPicker } from './ColorPicker'
import { FontFamilyPicker } from './FontFamilyPicker'
import { FontStylePicker } from './FontStylePicker'
import { FontWeightPicker } from './FontWeightPicker'

type BasicViewStyleConfigProps = {
    name: string
    config: BasicViewStyle | undefined
    background?: string
    setBackground?: (color: string) => void
    updateConfig: (updatedStyle: BasicViewStyle) => void
}

type BasicViewInspectorProps = {
    name: string
    title: BasicViewProps['title']
    titleName?: string
    subtitle: BasicViewProps['subtitle']
    subtitleName?: string
    bottomMessage?: BasicViewProps['bottomMessage']
    bottomMessageName?: string
    background?: string
    onUpdate: (updatedSlide: BasicViewProps) => void
    children?: ReactNode
}

export function BasicViewInspector({
    name,
    titleName = 'Title',
    subtitleName = 'Subtitle',
    bottomMessageName = 'Custom Message',
    onUpdate,
    ...slide
}: BasicViewInspectorProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col w-full">
                <h2 className="text-md font-medium">{name} Title</h2>
                <Input
                    className="py-2 text-lg"
                    defaultValue={slide.title?.text}
                    onChange={async (e) => {
                        const text = e.target.value.trim()
                        if (text === '') {
                            toast.error(`Please enter a ${name} title`)
                            return
                        }
                        onUpdate({
                            ...slide,
                            title: { ...slide.title, text },
                        })
                    }}
                    placeholder={`${name} title`}
                />
            </div>
            <div className="flex flex-col w-full">
                <h2 className="text-md font-medium">{name} Subtitle</h2>
                <Input
                    className="py-2 text-lg"
                    defaultValue={slide?.subtitle?.text}
                    onChange={async (e) => {
                        const text = e.target.value.trim()
                        if (text === '') {
                            toast.error(`Please enter a ${name} subtitle`)
                            return
                        }

                        onUpdate({
                            ...slide,
                            subtitle: { ...slide.subtitle, text },
                        })
                    }}
                    placeholder={`${name} subtitle`}
                />
            </div>
            <div className="flex flex-col w-full">
                <h2 className="text-md font-medium">{name} Bottom Message</h2>
                <Input
                    className="py-2 text-lg"
                    defaultValue={slide?.bottomMessage?.text}
                    onChange={async (e) => {
                        const value = e.target.value.trim()
                        onUpdate({
                            ...slide,
                            bottomMessage: {
                                ...slide.bottomMessage,
                                text: value === '' ? undefined : value,
                            },
                        })
                    }}
                    placeholder="Your custom message"
                />
            </div>
            <BasicViewStyleConfig
                name={titleName}
                background={slide.background}
                config={slide.title || {}}
                updateConfig={(style) => {
                    onUpdate({
                        ...slide,
                        title: {
                            text: slide.title?.text,
                            ...style,
                        },
                    })
                }}
                setBackground={(background) => {
                    onUpdate({ ...slide, background })
                }}
            />
            <BasicViewStyleConfig
                name={subtitleName}
                config={slide.subtitle || {}}
                updateConfig={(style) => {
                    onUpdate({
                        ...slide,
                        subtitle: {
                            ...slide.subtitle,
                            ...style,
                        },
                    })
                }}
            />
            <BasicViewStyleConfig
                name={bottomMessageName}
                config={slide.bottomMessage || {}}
                updateConfig={(style) => {
                    onUpdate({
                        ...slide,
                        bottomMessage: {
                            ...slide.bottomMessage,
                            ...style,
                        },
                    })
                }}
            />
        </div>
    )
}

export const BasicViewStyleConfig = ({
    name,
    background = '#000000',
    config = {},
    updateConfig,
    setBackground,
}: BasicViewStyleConfigProps) => {
    const uploadImage = useUploadImage()
    const [fontSize, setFontSize] = useState(config?.fontSize || 50)
    return (
        <>
            {setBackground ? (
                <div className="flex flex-col w-full">
                    <h2 className="text-md font-medium">Slide background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={background}
                        setBackground={(bg) => {
                            setBackground(bg)
                        }}
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
            ) : null}
            <div className="flex flex-col w-full">
                <h2 className="text-md font-medium">{name} Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config?.color || 'white'}
                    setBackground={(color) => {
                        updateConfig({ ...config, color })
                    }}
                />
            </div>
            <div className="flex flex-col w-full">
                <label className="text-md font-medium">
                    {name} Size ({fontSize}px)
                </label>

                <Slider
                    defaultValue={[fontSize]}
                    max={140}
                    step={2}
                    onValueChange={(newRange) => {
                        const size = newRange[0]
                        setFontSize(size)
                        updateConfig({ ...config, fontSize: size })
                    }}
                />
            </div>
            <div className="flex flex-col w-full">
                <h2 className="text-md font-medium">{name} Font</h2>
                <FontFamilyPicker
                    defaultValue={config?.fontFamily || 'Roboto'}
                    onSelect={(fontFamily) => {
                        updateConfig({ ...config, fontFamily })
                    }}
                />
            </div>
            <div className="flex flex-col  w-full">
                <h2 className="text-md font-medium">{name} Style</h2>
                <FontStylePicker
                    currentFont={config?.fontFamily || 'Roboto'}
                    defaultValue={config?.fontStyle || 'normal'}
                    onSelect={(fontStyle: string) => {
                        updateConfig({ ...config, fontStyle })
                    }}
                />
            </div>
            <div className="flex flex-col  w-full">
                <h2 className="text-md font-medium">{name} Weight</h2>
                <FontWeightPicker
                    currentFont={config?.fontFamily || 'Roboto'}
                    defaultValue={config?.fontWeight || 'normal'}
                    onSelect={(fontWeight) => {
                        updateConfig({ ...config, fontWeight })
                    }}
                />
            </div>
            <div className="flex flex-col  w-full">
                <h2 className="text-md font-medium">{name} Position</h2>
                <Select
                    defaultValue={config?.position || 'center'}
                    onChange={(value) => {
                        const position = value as 'left' | 'center' | 'right'
                        updateConfig({ ...config, position })
                    }}
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </Select>
            </div>
        </>
    )
}
