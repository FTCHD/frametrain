'use client'
import { Button, Stack } from '@mui/joy'
import { useState } from 'react'
import type { Config } from '.'


export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const [files, setFiles] = useState<any>([])
    return (
        <Stack width={'100%'} height={'100%'} gap={5}>
            Add Images
            <Button onClick={() => update({ vote: { buttons: [] } })}>Delete All</Button>
        </Stack>
    )
}
