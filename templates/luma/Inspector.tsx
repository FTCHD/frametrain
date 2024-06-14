'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useRef } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()

    const { eventId } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <p>{JSON.stringify(config)}</p>
            <h2 className="text-lg font-semibold">Lu.ma Event Preview Template</h2>

            <h3 className="text-lg font-semibold">Event ID:</h3>

            <p>{eventId}</p>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Input something"
                    ref={displayLabelInputRef}
                />
                <Button
                    onClick={() => {
                        if (!displayLabelInputRef.current?.value) return

                        updateConfig({ eventId: displayLabelInputRef.current.value })

                        displayLabelInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Enter the lu.ma event id of your choice
                </Button>
            </div>

            <Button
                variant="destructive"
                className="w-full "
                onClick={() => updateConfig({ text: '' })}
            >
                Delete
            </Button>
        </div>
    )
}
