'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '.'
import { useCallback, useEffect, useState } from 'react'
import { LoaderIcon } from 'lucide-react'
import { fetchData } from './utils/fetch'
import type { HostData, TicketInfo } from './utils/types'
import { formatAmount } from './utils/numbers'
import { dayjs } from './utils/dayjs'
import { generateSocialCard } from './utils/fetch-social-image'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { formatTimezone } from './utils/misc'

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
    const [loading, setLoading] = useState(false)
    const [eventId, setEventId] = useState<string | undefined>(config.event?.id)
    const [timezone, setTimezone] = useState(config.event?.timezone ?? 'Africa/Accra')

    const handleDataFetching = useCallback(
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
        async (id: string, tz: string) => {
            try {
                setLoading(true)
                const url = `https://lu.ma/${id}`
                const html = await fetchData(url)
                const parser = new DOMParser()
                const parsedhtml = parser.parseFromString(html, 'text/html')
                if (!parsedhtml) {
                    return null
                }
                const jsonData = parsedhtml.getElementById('__NEXT_DATA__')

                if (!jsonData?.textContent) {
                    return null
                }

                const jsonObj = JSON.parse(jsonData.textContent)

                const initialData = jsonObj?.props?.pageProps?.initialData?.data
                const eventData = initialData?.event
                const hostData = initialData?.hosts as HostData[] | null

                if (!(eventData && hostData)) {
                    return null
                }
                const startsAt = (eventData?.start_at ?? '') as string
                const ticketInfo = initialData?.ticket_info as TicketInfo | null
                const onlineEvent = eventData?.location_type === 'offline' ? 'OFFLINE' : 'ONLINE'
                const title = (eventData?.name ?? '') as string
                const cover = (eventData?.cover_url ?? '') as string

                const price = ticketInfo?.price
                    ? ticketInfo.is_free
                        ? 'FREE'
                        : formatAmount(ticketInfo.price.cents, ticketInfo.price.currency)
                    : 'N/A'

                const backgroundCover = generateSocialCard({
                    title: title,
                    img: cover,
                })
                const date = await formatTimezone(startsAt, tz)

                const data = {
                    hosts: hostData.map((h) => h.name),
                    price,
                    date,
                    backgroundCover,
                    locationType: onlineEvent,
                }

                updateConfig({
                    event: {
                        id,
                        ...data,
                        timezone: tz,
                    },
                })
                setLoading(false)
            } catch {
            } finally {
                setLoading(false)
            }
        },
        [updateConfig]
    )

    // uzjhg2is

    useEffect(() => {
        if (loading && eventId) {
            handleDataFetching(eventId, timezone).catch(console.log)
        }

        return () => {
            setLoading(false)
        }
    }, [handleDataFetching, eventId, timezone, loading])

    const timezones = Intl.supportedValuesOf('timeZone')
    const timezoneOptions = timezones.map((tz) => {
        return {
            label: tz,
            value: tz,
        }
    })

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
                            defaultValue={config.event?.id}
                            onChange={(e) => {
                                setEventId(extractEventId(e.target.value))
                            }}
                            placeholder="mpls6.18 or https://lu.ma/mpls6.18"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-2xl tracking-tight font-semibold">
                            Choose your preferred timezone:
                        </h2>

                        <Select defaultValue={timezone} onValueChange={setTimezone}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {timezoneOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            {timezone !== '' ? (
                <Button disabled={loading} className="w-full" onClick={() => setLoading(true)}>
                    {loading && <LoaderIcon className="mr-4 w-6 h-6 animate-spin" />}
                    Save
                </Button>
            ) : null}
        </div>
    )
}
