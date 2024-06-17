'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '.'
import { useState } from 'react'
import { LoaderIcon } from 'lucide-react'
import type { HostData, TicketInfo } from './utils/types'
import { formatAmount } from './utils/numbers'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { formatTimezone } from './utils/misc'
import { ColorPicker } from '@/sdk/components'
import { dimensionsForRatio } from '@/sdk/constants'
import { corsFetch } from '@/sdk/scrape'
import { fetchCover } from './utils/fetch'

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

// base64 to blob https://stackoverflow.com/a/16245768
const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data)
    const byteArrays: Uint8Array[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize)

        const byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
    }

    const blob = new Blob(byteArrays, { type: contentType })
    return blob
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [loading, setLoading] = useState(false)
    const [eventId, setEventId] = useState<string | undefined>(config.event?.id)
    const [timezone, setTimezone] = useState(config.event?.timezone ?? 'Africa/Accra')
    const [aspectRatio, setAspectRatio] = useState<keyof typeof dimensionsForRatio>(
        config.aspectRatio ?? '1/1'
    )

    // uzjhg2is
    console.log({ eventId, timezone, aspectRatio, loading })
    const timezones = Intl.supportedValuesOf('timeZone')
    const timezoneOptions = timezones.map((tz) => {
        return {
            label: tz,
            value: tz,
        }
    })

    return (
        <div className="h-full w-full flex flex-col gap-5">
            <div className="flex flex-col w-full gap-4">
                <h1 className="text-2xl font-bold">Lu.ma Event Preview Template</h1>
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
                    <h2 className="text-lg font-semibold">Information Banner background color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.backgroundColor || 'black'}
                        setBackground={(value) => updateConfig({ backgroundColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Information Text color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Aspect Ratio</h2>
                    <Select
                        disabled={!aspectRatio}
                        defaultValue={aspectRatio}
                        onValueChange={(value) => setAspectRatio(value as typeof aspectRatio)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Aspect Ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={'1/1'}>Square</SelectItem>
                            <SelectItem value={'1.91/1'}>Wide</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {timezone !== '' ? (
                    <Button
                        disabled={loading}
                        size="lg"
                        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
                        onClick={async () => {
                            if (!eventId) return

                            setLoading(true)

                            const url = `https://lu.ma/${eventId}`
                            const html = await corsFetch(url)
                            if (!html) {
                                return null
                            }

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
                            const onlineEvent =
                                eventData?.location_type === 'offline' ? 'OFFLINE' : 'ONLINE'
                            const title = (eventData?.name ?? '') as string
                            const cover = (eventData?.cover_url ?? '') as string

                            const price = ticketInfo?.price
                                ? ticketInfo.is_free
                                    ? 'FREE'
                                    : formatAmount(
                                          ticketInfo.price.cents,
                                          ticketInfo.price.currency
                                      )
                                : 'N/A'

                            const date = await formatTimezone(startsAt, timezone)

                            const data = {
                                id: eventId,
                                hosts: hostData.map((h) => h.name),
                                price,
                                date,
                                backgroundCover: cover,
                                locationType: onlineEvent,
                                title,
                                timezone,
                            }
                            const sizes =
                                dimensionsForRatio[aspectRatio as keyof typeof dimensionsForRatio]
                            const b64 = await fetchCover(data.backgroundCover)
                            console.log('gotten base64 with sizes', sizes)
                            const blob = b64toBlob(b64, 'image/jpeg')
                            //   https://stackoverflow.com/a/73744343
                            const compressImage = async () => {
                                const bitmap = await createImageBitmap(blob)
                                const canvas = document.createElement('canvas')
                                const ctx = canvas.getContext('2d')
                                if (!ctx) {
                                    return null
                                }

                                canvas.width = sizes.width
                                canvas.height = sizes.height

                                ctx.drawImage(bitmap, 0, 0, sizes.width, sizes.height)
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                                console.log(`compressedCover for ${url}`, dataUrl)
                                return dataUrl
                            }
                            const compressedCover = await compressImage()
                            try {
                                if (compressedCover) {
                                    const compressedSize = atob(
                                        compressedCover?.split(',')?.[1]
                                    ).length
                                    console.log(`compressedSize for ${url}`, compressedSize)
                                }
                            } catch {}

                            updateConfig({
                                event: {
                                    ...data,
                                    compressedCover,
                                },
                                aspectRatio,
                            })
                            setLoading(false)
                        }}
                    >
                        {loading ? <LoaderIcon className="mr-4 w-6 h-6 animate-spin" /> : 'Save'}
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
