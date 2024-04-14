'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
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
        <div className="w-full h-full space-y-8">
            {/* <pre>{JSON.stringify(vote, null, 2)}</pre> */}

            <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-semibold">Question</h2>
                <Input
                    placeholder="The poll question"
                    defaultValue={config.question}
                    onChange={(e) => update({ question: e.target.value })}
                    className=" py-2 text-lg"
                />
            </div>

            <div className="flex flex-col space-y-4">
                {options?.map((option, index) => (
                    <div className="flex flex-row justify-between items-center ">
                        <h2 className="text-lg font-semibold p-2 bg-secondary rounded-md">
                            {option.displayLabel}
                        </h2>
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
                        <h1 className="text-lg font-semibold">Voting Options</h1>
                        <Input
                            className="text-lg"
                            placeholder="Results Page Label"
                            ref={displayLabelInputRef}
                        />
                        <Input
                            className="text-lg"
                            placeholder="Button Label"
                            ref={buttonLabelInputRef}
                        />
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
                        className="w-full bg-border hover:bg-secondary-border text-primary"
                    >
                        Add Option
                    </Button>
                </div>
            )}

            <Button
                className="w-full  text-primary"
                onClick={() => update({ options: [] })}
                variant="destructive"
            >
                Delete All
            </Button>
        </div>
    )
}
