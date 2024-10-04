'use client'
import { GatingInspector, Input, Select, Switch } from '@/sdk/components'
import { useFarcasterId, useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { getFarcasterProfiles } from '@/sdk/neynar'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        async function setUserAddress() {
            if (!config.paymentAddress && fid) {
                try {
                    const users = await getFarcasterProfiles([fid])
                    const user = users[0]
                    const ethAddresses = user.verified_addresses.eth_addresses

                    if (ethAddresses.length === 0) {
                        return
                    }

                    updateConfig({
                        paymentAddress: ethAddresses[0],
                    })
                    toast.success('We set the address to your verified Warpcast address')
                } catch {
                    toast.error('We could not set the address to your verified Warpcast address')
                }
            }
        }

        setUserAddress()
    }, [fid])

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
                <Select
                    label="Cover Type"
                    value={config.coverType}
                    onChange={(value) =>
                        updateConfig({ coverType: value as 'image' | 'basicView' })
                    }
                    options={[
                        { label: 'Image', value: 'image' },
                        { label: 'Basic View', value: 'basicView' },
                    ]}
                />
                {config.coverType === 'image' && (
                    <Input
                        label="Cover Image URL"
                        value={config.coverImage}
                        onChange={(value) => updateConfig({ coverImage: value })}
                        placeholder="https://example.com/cover.jpg"
                    />
                )}
                {config.coverType === 'basicView' && (
                    <>
                        <Input
                            label="Cover Title"
                            value={config.coverTitle}
                            onChange={(value) => updateConfig({ coverTitle: value })}
                            placeholder="Ask Me Anything"
                        />
                        <Input
                            label="Cover Subtitle"
                            value={config.coverSubtitle}
                            onChange={(value) => updateConfig({ coverSubtitle: value })}
                            placeholder="Submit your questions and get answers"
                        />
                        <Input
                            label="Cover Bottom Message"
                            value={config.coverBottomMessage}
                            onChange={(value) => updateConfig({ coverBottomMessage: value })}
                            placeholder="Tap to start"
                        />
                    </>
                )}
            </Configuration.Section>
            <Configuration.Section title="Submitted">
                <Select
                    label="Submitted Type"
                    value={config.submittedType}
                    onChange={(value) =>
                        updateConfig({ submittedType: value as 'image' | 'basicView' })
                    }
                    options={[
                        { label: 'Image', value: 'image' },
                        { label: 'Basic View', value: 'basicView' },
                    ]}
                />
                {config.submittedType === 'image' && (
                    <Input
                        label="Submitted Image URL"
                        value={config.submittedImage}
                        onChange={(value) => updateConfig({ submittedImage: value })}
                        placeholder="https://example.com/submitted.jpg"
                    />
                )}
                {config.submittedType === 'basicView' && (
                    <>
                        <Input
                            label="Submitted Title"
                            value={config.submittedTitle}
                            onChange={(value) => updateConfig({ submittedTitle: value })}
                            placeholder="Question Submitted"
                        />
                        <Input
                            label="Submitted Subtitle"
                            value={config.submittedSubtitle}
                            onChange={(value) => updateConfig({ submittedSubtitle: value })}
                            placeholder="Thanks for your question!"
                        />
                        <Input
                            label="Submitted Bottom Message"
                            value={config.submittedBottomMessage}
                            onChange={(value) => updateConfig({ submittedBottomMessage: value })}
                            placeholder="We'll answer soon"
                        />
                    </>
                )}
            </Configuration.Section>
            <Configuration.Section title="Payment">
                <Switch
                    label="Enable Payment"
                    checked={config.paymentEnabled}
                    onChange={(value) => updateConfig({ paymentEnabled: value })}
                />
                {config.paymentEnabled && (
                    <>
                        <Input
                            label="Payment Amount (USDC)"
                            type="number"
                            value={config.paymentAmount}
                            onChange={(value) => updateConfig({ paymentAmount: Number(value) })}
                            placeholder="1"
                        />
                        <Input
                            label="Payment Address"
                            value={config.paymentAddress}
                            onChange={(value) => updateConfig({ paymentAddress: value })}
                            placeholder="0x..."
                        />
                    </>
                )}
            </Configuration.Section>
            <Configuration.Section title="Submissions">
                <Switch
                    label="Public Submissions"
                    checked={config.publicSubmissions}
                    onChange={(value) => updateConfig({ publicSubmissions: value })}
                />
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <GatingInspector fid={fid} />
            </Configuration.Section>
        </Configuration.Root>
    )
}
