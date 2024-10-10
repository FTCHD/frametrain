'use client'
import { GatingInspector, Input, Label } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import type { Config } from './types'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    return (
        <>
        <Configuration.Root>
            <Configuration.Section title="General">
                <Label htmlFor="rssFeedUrl">RSS Feed URL</Label>
                <Input
                    id="rssFeedUrl"
                    value={config.rssFeedUrl}
                    onChange={(e) => updateConfig({ rssFeedUrl: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-2">
                    To enable RSS for your Spotify podcast, go to Settings &gt; Availability &gt;
                    RSS Distribution.

                    <a href="https://support.spotify.com/us/podcasters/article/your-rss-feed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline">                    
                    Learn more
                    </a>
                </p>
        </Configuration.Section>

        <Configuration.Section title="Cover">
            <Label htmlFor="customCoverImage">Custom Cover Image URL (optional)</Label>
            <Input
                id="customCoverImage"
                value={config.customCoverImage || ''}
                onChange={(e) => updateConfig({ customCoverImage: e.target.value })}
            />
        </Configuration.Section>

        <Configuration.Section title="Episode">
            <p>Episode settings will be fetched from the RSS feed.</p>
        </Configuration.Section>

        <Configuration.Section title="Gating">
            <GatingInspector
                config={config.gating}
                onUpdate={(newGatingConfig) => updateConfig({ gating: newGatingConfig })}
            />
        </Configuration.Section>
    </Configuration.Root >
</>
    )
}