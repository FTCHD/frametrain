'use client'
import { Button, Stack } from '@mui/joy'
import type { Config } from '.'


export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    return (
        <Stack width={'100%'} height={'100%'} gap={5}>
            Add Images
            <Button onClick={() => update({ vote: { buttons: [] } })}>Delete All</Button>
        </Stack>
    )
}
