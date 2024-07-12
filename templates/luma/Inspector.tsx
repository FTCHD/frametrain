'use client'

import { Input } from '@/components/shadcn/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { ColorPicker } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { capitalize, formatAmount } from './utils/alphanum'
import { formatDate } from './utils/dates'
import { generateImageUrl, getLumaData } from './utils/luma'
import type { HostData, TicketInfo } from './utils/types'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const timezones = Intl.supportedValuesOf('timeZone')
    const timezoneOptions = timezones.map((tz) => {
        return {
            label: tz,
            value: tz,
        }
    })

    async function onChange(e: any) {
        const initialData = await getLumaData(e.target.value)
        const eventData = initialData?.event
        const hostData = initialData?.hosts as HostData[] | null

        if (!(eventData && hostData)) {
            return
        }
        const geo = eventData?.geo_address_info as {
            obfuscated: boolean
            citystorage: string
        } | null
        let address = 'N/A'

        if (eventData?.location_type === 'offline' && geo) {
            address = `${capitalize(geo.citystorage)} (OFFLINE)`
        } else if (eventData?.location_type !== 'offline') {
            address = `${capitalize(eventData.location_type)} (ONLINE)`
        }
        const ticketInfo = initialData?.ticket_info as TicketInfo | null
        const title = (eventData?.name ?? '') as string
        const coverUrl = (eventData?.cover_url ?? '') as string

        const price = ticketInfo?.price
            ? formatAmount(ticketInfo.price.cents, ticketInfo.price.currency)
            : 'FREE ENTRY'

        const startsAt = eventData?.start_at
            ? formatDate(config.event?.timezone ?? 'Europe/London', eventData.start_at as string)
            : null

        const endsAt = eventData?.end_at ? (eventData.end_at as string) : null

        console.log(coverUrl)
        console.log(generateImageUrl(coverUrl, 500))

        const event = {
            id: eventData.url,
            hosts: hostData.map((h) => h.name),
            price,
            startsAt,
            title,
            timezone: config.event?.timezone ?? 'Europe/London',
            address,
            approvalRequired: ticketInfo?.require_approval ?? false,
            endsAt,
            remainingSpots: ticketInfo?.spots_remaining ?? null,
            backgroundImage: generateImageUrl(coverUrl, 1000, 50),
            image: generateImageUrl(coverUrl, 500, 100),
        }

        updateConfig({
            event,
        })
    }

    const debouncedOnChange = useDebouncedCallback(onChange, 500)

    return (
        <div className="h-full w-full flex flex-col gap-5">
            <div className="flex flex-col w-full gap-4">
                <h1 className="text-2xl font-bold">Lu.ma</h1>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Event</h2>
                    <p className="text-sm text-muted-foreground">
                        You can use the event ID or the full URL.
                    </p>
                    <Input
                        className="py-2 text-lg "
                        defaultValue={config.event?.id}
                        onChange={debouncedOnChange}
                        placeholder="mpls6.18 or https://lu.ma/mpls6.18"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Timezone</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose your preferred timezone to display the event start time.
                    </p>
                    <Select
                        defaultValue={config.event?.timezone ?? 'Europe/London'}
                        onValueChange={async (value) => {
                            if (!config.event) return

                            const initialData = await getLumaData(config.event.id)

                            const eventData = initialData?.event

                            const startsAt = eventData?.start_at
                                ? formatDate(
                                      config.event?.timezone ?? 'Europe/London',
                                      eventData.start_at as string
                                  )
                                : null

                            updateConfig({
                                event: {
                                    ...config.event,
                                    timezone: value,
                                    startsAt,
                                },
                            })
                        }}
                    >
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
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Custom Message</h2>
                    <p className="text-sm text-muted-foreground">
                        If you want to display your own message, enter it here.
                    </p>
                    <Input
                        className="py-2 text-lg"
                        defaultValue={config.customMessage}
                        onChange={async (e) => {
                            updateConfig({
                                customMessage: e.target.value === '' ? undefined : e.target.value,
                            })
                        }}
                        placeholder="Don't forget to bring your laptop!"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Message Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.customMessageColor || 'white'}
                        setBackground={(value) => updateConfig({ customMessageColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Title Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Info Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.infoColor || 'white'}
                        setBackground={(value) => updateConfig({ infoColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Fee Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.priceColor || 'white'}
                        setBackground={(value) => updateConfig({ priceColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Fee Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.priceBackgroundColor || 'black'}
                        setBackground={(value) => updateConfig({ priceBackgroundColor: value })}
                    />
                </div>
            </div>
        </div>
    )
}
