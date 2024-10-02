'use client'
import { BasicViewInspector, GatingInspector, Switch } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import type { Config } from '.'

type GatingConfig = Required<Config['gating']>

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const gatingConfig: GatingConfig = config.gating || {
        enabled: [],
        requirements: {
            maxFid: 0,
            minFid: 0,
            score: 0,
            channels: [],
            exactFids: [],
            erc20: null,
            erc721: null,
            erc1155: null,
            moxie: null,
        },
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="General">
                <label>
                    Cooldown (seconds):
                    <input
                        type="number"
                        value={config.cooldown}
                        onChange={(e) =>
                            updateConfig({ cooldown: Number.parseInt(e.target.value) || -1 })
                        }
                        min="-1"
                    />
                </label>
                <label>
                    Public:
                    <input
                        type="checkbox"
                        checked={config.isPublic}
                        onChange={(e) => updateConfig({ isPublic: e.target.checked })}
                    />
                </label>
            </Configuration.Section>
            <Configuration.Section title="Cover">
                <BasicViewInspector
                    config={config.coverConfig}
                    onChange={(newCoverConfig) => updateConfig({ coverConfig: newCoverConfig })}
                />
            </Configuration.Section>
            <Configuration.Section title="Answer">
                <BasicViewInspector
                    config={config.answerConfig}
                    onChange={(newAnswerConfig) => updateConfig({ answerConfig: newAnswerConfig })}
                />
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <Switch
                    checked={config.enableGating ?? false}
                    onCheckedChange={(checked) => updateConfig({ enableGating: checked })}
                />
                {config.enableGating && (
                    <GatingInspector
                        config={gatingConfig}
                        onChange={(newGatingConfig) => updateConfig({ gating: newGatingConfig })}
                    />
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}
