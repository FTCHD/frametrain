'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '.'

/**
 * extractEventId
 * a function that extracts the event id out of a given lu.ma event url
 * @example
 * https://lu.ma/SWBHappyHour -> SWBHappyHour
 * @param url - the lu.ma event url to extract the id from
 * @returns the extracted event id
 *
 */
function extractEventId(url: string): string {
    return url.startsWith('https://lu.ma/') ? url.split('https://lu.ma/')[1] : url
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    return (
        <div className="w-full h-full flex flex-col gap-5">
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-2xl font-bold">Lu.ma Event Preview Template</h1>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Add your lu.ma event id or url</h2>
                        <p className="text-sm text-muted-foreground">
                            You can use the event id or the full url of the event
                        </p>
                        <Input
                            className="py-2 text-lg "
                            defaultValue={config.eventId}
                            onChange={(e) => {
                                const eventId = extractEventId(e.target.value)
                                updateConfig({
                                    eventId,
                                })
                            }}
                            placeholder="mpls6.18 or https://lu.ma/mpls6.18"
                        />
                    </div>
                </div>
            </div>

            <Button
                variant="destructive"
                className="w-full "
                onClick={() => updateConfig({ eventId: '' })}
            >
                Delete
            </Button>
        </div>
    )
}
