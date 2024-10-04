'use client'
import { GatingInspector, Input } from '@/sdk/components'
import { useFarcasterId, useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { getFarcasterProfiles } from '@/sdk/neynar'
import { useEffect, useState } from 'react'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { MAX_TOKENS_LIMIT, SUPPORTED_NETWORKS } from './constants'
import type { Config } from './types'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [tooManyTokens, setTooManyTokens] = useState(false)
    const fid = useFarcasterId()

    useEffect(() => {
        async function setUserAddress() {
            if (!config.walletAddress && fid) {
                try {
                    const users = await getFarcasterProfiles([fid])
                    const user = users[0]
                    const ethAddresses = user.verified_addresses.eth_addresses

                    if (ethAddresses.length === 0) {
                        return
                    }

                    updateConfig({
                        walletAddress: ethAddresses[0],
                    })
                    toast.success('We set the address to your verified Warpcast address')
                } catch {
                    toast.error('We could not set the address to your verified Warpcast address')
                }
            }
        }

        setUserAddress()
    }, [fid])

    const { text } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)

    return (
        <Configuration.Root>
            <Configuration.Section title="General">
                <select
                    value={config.selectedNetwork}
                    onChange={(e) => handleNetworkChange(Number(e.target.value))}
                >
                    {SUPPORTED_NETWORKS.map((network) => (
                        <option key={network.chainId} value={network.chainId}>
                            {network.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={config.walletAddress}
                    onChange={(e) => updateConfig({ walletAddress: e.target.value })}
                    placeholder="Wallet Address"
                />
                <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) =>
                        updateConfig({
                            maxTokens: Math.min(Number(e.target.value), MAX_TOKENS_LIMIT),
                        })
                    }
                    placeholder={`Max Tokens (up to ${MAX_TOKENS_LIMIT})`}
                />
            </Configuration.Section>
            <Configuration.Section title="Whitelist">
                {tooManyTokens && (
                    <div className="warning">
                        Too many tokens detected. Please select specific tokens in the whitelist.
                    </div>
                )}

                <Input
                    tokens={config.whitelistedTokens}
                    onChange={(tokens) => updateConfig({ whitelistedTokens: tokens })}
                    chainId={config.chainId}
                />
            </Configuration.Section>
            <Configuration.Section title="Blacklist">
                <Input
                    tokens={config.blacklistedTokens}
                    onChange={(tokens) => updateConfig({ blacklistedTokens: tokens })}
                    chainId={config.chainId}
                />
            </Configuration.Section>
            <Configuration.Section title="Cover">
                <input
                    type="checkbox"
                    checked={config.useBasicViewForCover}
                    onChange={(e) => updateConfig({ useBasicViewForCover: e.target.checked })}
                />
                Use BasicView for Cover
            </Configuration.Section>
            <Configuration.Section title="Success">
                <input
                    type="checkbox"
                    checked={config.useBasicViewForSuccess}
                    onChange={(e) => updateConfig({ useBasicViewForSuccess: e.target.checked })}
                />
                Use BasicView for Success
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <GatingInspector />
            </Configuration.Section>
        </Configuration.Root>
    )
}
