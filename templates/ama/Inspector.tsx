'use client'
import { Button, Input } from '@/sdk/components'
import { useFrameConfig, useFarcasterName, useFarcasterId } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { useRef, useState, useEffect } from 'react'
import type { Config } from '.'


export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [ques, setQues] = useState('')
    const [ans, setAns] = useState("")

    const { text, questions, answers } = config
    const username = useFarcasterName();
    const fid = useFarcasterId();

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!config?.owner) {
            updateConfig({
                owner: {
                    username, 
                    fid
                }
            })
        }
    }, [])

    return (
        <Configuration.Root>
            <Configuration.Section title="Qusetion">
                <p>{JSON.stringify(config)}</p>
                <h2 className="text-lg font-semibold">Ask Me anything, i'm here to anser your question </h2>

                <h3 className="text-lg font-semibold">Text</h3>

                <p>{text}</p>
                <p>Previous Question</p>
                <p>{questions}</p>

                <div className="flex flex-col gap-2 ">
                    <Input
                        className="text-lg"
                        placeholder="Ask Me Anything"
                        ref={displayLabelInputRef}
                        onChange={(e) => updateConfig({ questions: e.target.value })}
                    />
                    
                    <Button
                        onClick={() => {
                            if (!displayLabelInputRef.current?.value) return

                            updateConfig({ text: displayLabelInputRef.current.value })
                            updateConfig({ questions: ques})

                            displayLabelInputRef.current.value = ''
                        }}
                        className="w-full bg-border hover:bg-secondary-border text-primary"
                    >
                        Set Text
                    </Button>
                </div>

                <div>
                <Input
                        className="text-lg"
                        placeholder="Anwser"
                        ref={displayLabelInputRef}
                        onChange={(e) => updateConfig({ answers: e.target.value })}
                    />

                </div>

                <Button
                    variant="destructive"
                    className="w-full "
                    onClick={() => updateConfig({ text: '' })}
                >
                    Delete
                </Button>
            </Configuration.Section>
        </Configuration.Root>
    )
}
