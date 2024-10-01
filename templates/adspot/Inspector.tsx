'use client'
import { Button, Input, Select, RadioGroup, Label, ColorPicker } from '@/sdk/components'
import { useFrameConfig, useFarcasterId, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import React from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const uploadImage = useUploadImage()

    return (
        <Configuration.Root>
            <Configuration.Section title="Operational Mode">
                <Select
                    value={config.mode}
                    onChange={(e) => updateConfig({ mode: e.target.value as 'Continuous' | 'Auction' })}
                >
                    <option value="Continuous">Continuous</option>
                    <option value="Auction">Auction</option>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                    Continuous Mode: The highest bid secures the space at any given moment.
                    Auction Mode: A predetermined deadline is set for bids.
                </p>
                {config.mode === 'Auction' && (
                    <>
                        <Input
                            type="datetime-local"
                            value={config.deadline ? new Date(config.deadline).toISOString().slice(0, 16) : ''}
                            onChange={(e) => updateConfig({ deadline: new Date(e.target.value).getTime() })}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Set the deadline for your auction. After this time, no new bids will be accepted.
                        </p>
                    </>
                )}
                {config.mode === 'Continuous' && (
                    <>
                        <Input
                            type="number"
                            placeholder="Expiration time (hours)"
                            value={config.expiry}
                            onChange={(e) => updateConfig({ expiry: Number(e.target.value) })}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Set how long (in hours) the winning bid will hold the ad space before it resets.
                        </p>
                    </>
                )}
            </Configuration.Section>

            <Configuration.Section title="Cover">
                <RadioGroup.Root
                    value={config.coverType}
                    onValueChange={(value: 'text' | 'image') => updateConfig({ coverType: value })}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroup.Item value="text" id="text" />
                        <Label htmlFor="text">Text</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroup.Item value="image" id="image" />
                        <Label htmlFor="image">Image</Label>
                    </div>
                </RadioGroup.Root>

                {config.coverType === 'text' && (
                    <>
                        <Input
                            placeholder="Title"
                            value={config.cover.title}
                            onChange={(e) => updateConfig({ cover: { ...config.cover, title: e.target.value } })}
                        />
                        <Input
                            placeholder="Subtitle (optional)"
                            value={config.cover.subtitle}
                            onChange={(e) => updateConfig({ cover: { ...config.cover, subtitle: e.target.value } })}
                        />
                    </>
                )}

                {config.coverType === 'image' && (
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                const reader = new FileReader()
                                reader.onload = async (event) => {
                                    const base64String = event.target?.result as string
                                    const { filePath } = await uploadImage({
                                        base64String: base64String.split(',')[1],
                                        contentType: file.type,
                                    })
                                    updateConfig({ cover: { ...config.cover, image: filePath } })
                                }
                                reader.readAsDataURL(file)
                            }
                        }}
                    />
                )}

                <ColorPicker
                    background={config.cover.backgroundColor}
                    setBackground={(color) => updateConfig({ cover: { ...config.cover, backgroundColor: color } })}
                />

                <ColorPicker
                    background={config.cover.textColor}
                    setBackground={(color) => updateConfig({ cover: { ...config.cover, textColor: color } })}
                />
            </Configuration.Section>

            <Configuration.Section title="Visit Link">
                <Input
                    placeholder="Visit link URL"
                    value={config.visitLink}
                    onChange={(e) => updateConfig({ visitLink: e.target.value })}
                />
            </Configuration.Section>

            <Configuration.Section title="Proprietor">
                <Input
                    placeholder="Proprietor's FID"
                    value={config.owner}
                    onChange={(e) => updateConfig({ owner: e.target.value })}
                />
                <Button onClick={() => updateConfig({ owner: fid })}>Utilize My FID</Button>
            </Configuration.Section>
        </Configuration.Root>
    )
}