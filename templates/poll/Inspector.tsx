'use client'
import { Button, IconButton, Input, Stack, Typography } from '@mui/joy'
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
        <Stack width={'100%'} height={'100%'} gap={5}>
            {/* <pre>{JSON.stringify(vote, null, 2)}</pre> */}

            <Stack direction={'column'} gap={2}>
                <Typography level="title-lg">Question</Typography>
                <Input
                    size="lg"
                    placeholder="The poll question"
                    defaultValue={config.question}
                    onChange={(e) => update({ question: e.target.value })}
                />
            </Stack>

            <Stack direction={'column'} gap={2}>
                {options?.map((option, index) => (
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                        <Typography key={index} level="body-md" variant="soft" padding={1}>
                            {option.displayLabel}
                        </Typography>
                        <IconButton
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
                        </IconButton>
                    </Stack>
                ))}
            </Stack>
            {(!options || options.length < 4) && (
                <Stack direction={'column'} gap={2}>
                    <Stack direction={'column'} gap={2}>
                        <Typography level="title-lg">Voting Options</Typography>
                        <Input
                            size="lg"
                            placeholder="Results Page Label"
                            slotProps={{ input: { ref: displayLabelInputRef } }}
                        />
                        <Input
                            size="lg"
                            placeholder="Button Label"
                            slotProps={{ input: { ref: buttonLabelInputRef } }}
                        />
                    </Stack>
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
                </Stack>
            )}

            <Button onClick={() => update({ options: [] })}>Delete All</Button>
        </Stack>
    )
}
