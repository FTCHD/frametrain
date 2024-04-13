'use client'
import { Button } from '@/components/ui/button'
import type { Config } from '.'


export default function Inspector({
    config,
    update,
}: { config: Config; update: (props: any) => void }) {
    return (
        <div className="w-full h-full space-y-4">
            <h2 className="text-base">Add Images</h2>
            <Button onClick={() => update({ vote: { buttons: [] } })}>Delete All</Button>
        </div>
    )
}
