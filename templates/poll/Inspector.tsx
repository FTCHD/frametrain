'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRef } from 'react'
import { X } from 'react-feather'
import type { Config } from '.'

export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const { options } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)
    const buttonLabelInputRef = useRef<HTMLInputElement>(null)

    const questionInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            {/* <pre>{JSON.stringify(vote, null, 2)}</pre> */}

            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-bold">Question</h2>
                <Input
                    placeholder="The poll question"
                    defaultValue={config.question}
                    onChange={(e) => update({ question: e.target.value })}
                    className=""
                />
            </div>

            <div className="flex flex-col space-y-2">
                {options?.map((option, index) => (
                    <div className="flex flex-row justify-between items-center ">
                        <h2 className="text-base p-2 ">{option.displayLabel}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                update({
                                    options: [
                                        ...options.slice(0, index),
                                        ...options.slice(index + 1),
                                    ],
                                })
                            }
                        >
                            <X />
                        </Button>
                    </div>
                ))}
            </div>
            {(!options || options.length < 4) && (
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col space-y-4">
                        <h1 className="text-lg font-bold">Voting Options</h1>
                        <Input placeholder="Results Page Label" ref={displayLabelInputRef} />
                        <Input placeholder="Button Label" ref={buttonLabelInputRef} />
                    </div>
                    <Button
                        onClick={() => {
                            if (!displayLabelInputRef.current?.value) return
                            if (!buttonLabelInputRef.current?.value) return

                            const optionIndex = options?.length
                                ? Math.max(...options.map((o) => o.index)) + 1
                                : 1

                            const newOptions = [
                                ...(options || []),
                                {
                                    index: optionIndex,
                                    displayLabel: displayLabelInputRef.current.value,
                                    buttonLabel: buttonLabelInputRef.current.value,
                                },
                            ]

                            update({ options: newOptions })

                            displayLabelInputRef.current.value = ''
                            buttonLabelInputRef.current.value = ''
                        }}
                    >
                        Add Option
                    </Button>
                </div>
            )}

            <Button onClick={() => update({ options: [] })}>Delete All</Button>
        </div>
    )
}
