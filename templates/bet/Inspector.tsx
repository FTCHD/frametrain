'use client'
import {
    Button,
    ColorPicker,
    FontFamilyPicker,
    Input,
    Label,
    Select,
    Switch,
} from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useResetPreview, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [isPublic, setIsPublic] = useState(config.isPublic ?? true)
    const [currency, setCurrency] = useState(config.currency ?? 'ETH')

    const fid = useFarcasterId()
    const uploadImage = useUploadImage()
    const resetPreview = useResetPreview()

    useEffect(() => {
        setIsPublic(config.isPublic ?? true)
        setCurrency(config.currency ?? 'ETH')
    }, [config])

    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        updateConfig({
            deadline: {
                ...config.deadline,
                [name]: value,
            },
        })
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="General" description="Configure your bet">
                <Input
                    label="Bet Idea"
                    placeholder="I bet you that..."
                    value={config.betIdea ?? ''}
                    onChange={(e) => updateConfig({ betIdea: e.target.value })}
                />
                <Input
                    label="Counterparty"
                    placeholder="@username"
                    value={config.counterparty ?? ''}
                    onChange={(e) => updateConfig({ counterparty: e.target.value })}
                />
                <Input
                    label="Arbitrator"
                    placeholder="@username"
                    value={config.arbitrator ?? ''}
                    onChange={(e) => updateConfig({ arbitrator: e.target.value })}
                />
                <Input
                    label="Backup Arbitrator"
                    placeholder="@username"
                    value={config.backupArbitrator ?? ''}
                    onChange={(e) => updateConfig({ backupArbitrator: e.target.value })}
                />
                <Input
                    label="Amount"
                    type="number"
                    value={config.amount?.toString() ?? '0'}
                    onChange={(e) => updateConfig({ amount: Number(e.target.value) })}
                />
                <Select
                    label="Currency"
                    value={currency}
                    onChange={(e) => {
                        setCurrency(e.target.value)
                        updateConfig({ currency: e.target.value })
                    }}
                >
                    {(config.supportedCurrencies ?? []).map((curr) => (
                        <option key={curr} value={curr}>
                            {curr}
                        </option>
                    ))}
                </Select>
                <div>
                    <Label htmlFor="deadlineDate">Deadline Date (optional)</Label>
                    <Input
                        id="deadlineDate"
                        type="date"
                        name="date"
                        value={config.deadline?.date ?? ''}
                        onChange={handleDeadlineChange}
                    />
                </div>
                <div>
                    <Label htmlFor="deadlineTime">Deadline Time (optional)</Label>
                    <Input
                        id="deadlineTime"
                        type="time"
                        name="time"
                        value={config.deadline?.time ?? ''}
                        onChange={handleDeadlineChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="isPublic">Public Bet</Label>
                    <Switch
                        id="isPublic"
                        checked={isPublic}
                        onCheckedChange={(checked) => {
                            setIsPublic(checked)
                            updateConfig({ isPublic: checked })
                        }}
                    />
                </div>
            </Configuration.Section>
            <Configuration.Section
                title="Customization"
                description="Customize your bet's appearance"
            >
                <FontFamilyPicker
                    defaultValue={config.fontFamily || 'Roboto'}
                    onSelect={(font) => {
                        updateConfig({
                            fontFamily: font,
                        })
                    }}
                />
                <ColorPicker
                    className="w-full"
                    background={config.primaryColor || '#ffffff'}
                    setBackground={(value: string) =>
                        updateConfig({
                            primaryColor: value,
                        })
                    }
                />
                <ColorPicker
                    className="w-full"
                    background={config.secondaryColor || '#000000'}
                    setBackground={(value: string) =>
                        updateConfig({
                            secondaryColor: value,
                        })
                    }
                />
                <ColorPicker
                    enabledPickers={['solid', 'gradient', 'image']}
                    background={config.background || '#000000'}
                    setBackground={(e) =>
                        updateConfig({
                            background: e,
                        })
                    }
                    uploadBackground={async (base64String, contentType) => {
                        const { filePath } = await uploadImage({
                            base64String: base64String,
                            contentType: contentType,
                        })

                        return filePath
                    }}
                />
            </Configuration.Section>
            <Configuration.Section title="Share" description="Share your bet">
                <Button
                    onClick={() => {
                        const shareUrl = `https://warpcast.com/~/compose?text=Do you take my bet, ${
                            config.counterparty ?? ''
                        }?&embeds[]=${encodeURIComponent(
                            `https://frametra.in/f/${config.id ?? ''}`
                        )}`
                        window.open(shareUrl, '_blank')
                    }}
                >
                    Share Bet
                </Button>
            </Configuration.Section>
        </Configuration.Root>
    )
}
