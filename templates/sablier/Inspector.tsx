'use client'
import { Input } from '@/components/ui/input'
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
        <div className="h-full w-full space-y-4">
            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-bold">Stream ID</h2>
                <Input ref={inputRef} onChange={handleInputChange} />
                <p className="text-sm text-muted-foreground">
                    In "XX-YY-ZZ" format, eg. <code>LL-1-121</code>.
                </p>
            </div>
        </div>
    )
}
