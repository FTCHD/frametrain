'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import type { Config } from '.'
import type { HostData, TicketInfo } from './utils/types'
import { formatAmount } from './utils/alphanum'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { ColorPicker } from '@/sdk/components'
import { dimensionsForRatio } from '@/sdk/constants'
import { corsFetch } from '@/sdk/scrape'
import { fetchCover } from './utils/fetch'

function extractEventId(url: string): string {
    return url.startsWith('https://lu.ma/') ? url.split('https://lu.ma/')[1] : url
}

function capitalize(str: string): string {
    return str.replace(/\b\w/g, (l) => l.toUpperCase())
}

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
                        onChange={async (e) => {
                            const id = extractEventId(e.target.value)
                            if (!id) return

                            const url = `https://lu.ma/${id}`
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
                            const geo = eventData?.geo_address_info as {
                                obfuscated: boolean
                                city_state: string
                            } | null
                            let address = 'N/A'

                            if (eventData?.location_type === 'offline' && geo) {
                                address = `${capitalize(geo.city_state)} (OFFLINE)`
                            } else if (eventData?.location_type !== 'offline') {
                                address = `${capitalize(eventData.location_type)} (ONLINE)`
                            }
                            const ticketInfo = initialData?.ticket_info as TicketInfo | null
                            const title = (eventData?.name ?? '') as string
                            const coverUrl = (eventData?.cover_url ?? '') as string

                            const price = ticketInfo?.price
                                ? ticketInfo.is_free
                                    ? 'FREE'
                                    : formatAmount(
                                          ticketInfo.price.cents,
                                          ticketInfo.price.currency
                                      )
                                : '$0.00'

                            const endsAt = eventData?.end_at ? (eventData.end_at as string) : null

                            const data = {
                                id,
                                hosts: hostData.map((h) => h.name),
                                price,
                                startsAt,
                                title,
                                timezone: config.event?.timezone ?? 'Africa/Accra',
                                address,
                                approvalRequired: ticketInfo?.require_approval ?? false,
                                endsAt,
                                remainingSpots: ticketInfo?.spots_remaining ?? null,
                            }
                            const generateCoverUrl = (quality = 75, sizes = 100, isBg = false) => {
                                const url = new URL(coverUrl)
                                const paths = url.pathname.split('/')
                                return `https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,${
                                    isBg ? '' : 'dpr=2,'
                                }quality=${quality},width=${sizes},height=${sizes}/event-covers/${paths
                                    .slice(-2)
                                    .join('/')}`
                            }
                            const cover = generateCoverUrl(30, 100, true) // for the top image
                            const image = generateCoverUrl(40, 80) // for the background image

                            const sizes = dimensionsForRatio['1/1']

                            const compressImage = async (image: string, useSizes = false) => {
                                const b64 = await fetchCover(image)
                                const blob = b64toBlob(b64, 'image/jpeg')
                                const bitmap = await createImageBitmap(blob)
                                const canvas = document.createElement('canvas')
                                const ctx = canvas.getContext('2d')
                                if (!ctx) {
                                    return null
                                }
                                const size = useSizes ? sizes : bitmap
                                canvas.width = size.width
                                canvas.height = size.height
                                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
                                const dataUrl = canvas.toDataURL('image/jpeg')

                                return dataUrl
                            }
                            const backgroundCover = cover //await compressImage(cover, true)
                            const imageCover = await compressImage(image)

                            const event = {
                                ...data,
                                backgroundCover,
                                image: imageCover,
                            }

                            updateConfig({
                                event,
                            })

                            console.log('saved event data', event)
                        }}
                        placeholder="mpls6.18 or https://lu.ma/mpls6.18"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl tracking-tight font-semibold">
                        Choose your preferred timezone:
                    </h2>
                    <Select
                        defaultValue={config.event?.timezone ?? 'Africa/Accra'}
                        onValueChange={(value) => {
                            if (!config.event) return
                            updateConfig({
                                event: {
                                    ...config.event,
                                    timezone: value,
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
                {/* <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg font-semibold">Background color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.backgroundColor || '#202224'}
                        setBackground={(value) => updateConfig({ backgroundColor: value })}
                    />
                </div> */}
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
                    <h2 className="text-lg font-semibold">Information Text color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.infoColor || '#ffffff80'}
                        setBackground={(value) => updateConfig({ infoColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Price Text color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.priceColor || '#4b5563'}
                        setBackground={(value) => updateConfig({ priceColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Price background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid']}
                        background={config.priceBackgroundColor || '#414142'}
                        setBackground={(value) => updateConfig({ priceBackgroundColor: value })}
                    />
                </div>
            </div>
        </div>
    )
}
