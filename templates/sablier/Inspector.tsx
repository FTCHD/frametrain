'use client'
import { FormControl, FormHelperText, FormLabel, Input, Stack, Typography } from '@mui/joy'
import { useEffect, useRef } from 'react'
import type { Config } from '.'
import { getStreamData, getStreamType } from './utils/actions'

export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        console.log('Triggered useEffect', config.streamId)

        if (!inputRef.current) return
        if (!config.streamId) return

        inputRef.current.value = config.streamId

        console.log('Got stream id', config.streamId)
    }, [config.streamId])

    async function handleInputChange(e: any) {
        const streamId = e.target.value

        const data = await getStreamData(streamId)

        const streamType = await getStreamType(data)

        update({ streamId: streamId, shape: streamType })
    }

    return (
        <Stack width={'100%'} height={'100%'} gap={5}>
            <Typography level="h2">Sablier</Typography>
            <FormControl size="lg">
                <FormLabel>Stream ID</FormLabel>
                <Input slotProps={{ input: { ref: inputRef } }} onChange={handleInputChange} />
                <FormHelperText>
                    In <pre>XX-YY-ZZ</pre> format, eg. <code>LL-1-121</code>.
                </FormHelperText>
            </FormControl>
        </Stack>
    )
}
