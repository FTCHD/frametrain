'use client'
import { Input } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    return (
        <Configuration.Root>
            <Configuration.Section title="Settings">
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Number of Stories</h2>
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        defaultValue={config.numberOfStories}
                        onChange={(e) =>
                            updateConfig({ numberOfStories: parseInt(e.target.value, 10) })
                        }
                    />
                </div>
            </Configuration.Section>
        </Configuration.Root>
    )
}
