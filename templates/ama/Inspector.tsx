'use client'
import { BasicViewInspector } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    return (
        <Configuration.Root>
            <Configuration.Section title="Cover">
                <p>{JSON.stringify(config)}</p>

                <BasicViewInspector
                    name="Cover"
                    title={config.cover.title}
                    subtitle={config.cover.subtitle}
                    background={config.cover.background}
                    onUpdate={(cover) => {
                        updateConfig({ cover: cover })
                    }}
                />
            </Configuration.Section>
        </Configuration.Root>
    )
}
