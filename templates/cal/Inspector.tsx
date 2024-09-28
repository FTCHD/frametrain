'use client'
import {
    Badge,
    Button,
    ColorPicker,
    FontFamilyPicker,
    FontStylePicker,
    FontWeightPicker,
    GatingInspector,
    Input,
    Label,
    Select,
    Switch,
} from '@/sdk/components'
import { useFarcasterId, useFrameConfig, useResetPreview, useUploadImage } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { corsFetch } from '@/sdk/scrape'
import { LoaderIcon, TrashIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import type { Config } from '.'
import { fetchProfileData } from './utils/cal'
import { getDurationFormatted } from './utils/date'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const fid = useFarcasterId()
    const uploadImage = useUploadImage()
    const resetPreview = useResetPreview()

    const slugInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const events = config.events || []
    const eventSlugs = events.map((evt) => evt.slug)
    const disableFields = config.events.length === 0
    const enabledGating = config.enableGating ?? false

    const timezones = Intl.supportedValuesOf('timeZone')
    const timezoneOptions = timezones.map((tz) => {
        return {
            label: tz,
            value: tz,
        }
    })

    const onChangeUsername = useDebouncedCallback(async (username: string) => {
        if (config.username === username) return

        if (username === '') {
            resetPreview()
            updateConfig({
                name: undefined,
                username: undefined,
                image: undefined,
                bio: [],
                fid: undefined,
                events: [],
            })
            return
        }

        try {
            const data = await fetchProfileData(username)
            if (!data) return
            resetPreview()
            updateConfig({
                ...data,
                fid,
                events: [],
            })
        } catch {}
    }, 1000)

    const fetchEventDetails = async (eventSlug: string) => {
        if (eventSlugs.includes(eventSlug)) {
            setLoading(false)
            toast.error(`Event type ${eventSlug} already added`)
            return
        }

        setLoading(true)

        const text = await corsFetch(
            `https://cal.com/api/trpc/public/event?batch=1&input={"0":{"json":{"username":"${config.username}","eventSlug":"${eventSlug}","isTeamEvent":false,"org":null}}}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        const data = JSON.parse(text as string)
        const json = data[0].result.data.json
        if (json === null) {
            toast.error(`No event type found for: ${eventSlug}`)
            setLoading(false)
            return
        }

        const slug = data[0].result.data.json.slug as string
        const duration = data[0].result.data.json.length as number
        const newEvents = [
            ...events,
            {
                slug: slug,
                duration: duration,
                formattedDuration: getDurationFormatted(duration),
            },
        ]
        updateConfig({ events: newEvents })
        setLoading(false)
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="Username" description="Your Cal.com username">
                <Input
                    className="text-lg max-md:text-base"
                    placeholder="Your Cal.com username"
                    defaultValue={config.username}
                    onChange={(e) => {
                        onChangeUsername(e.target.value)
                    }}
                />
            </Configuration.Section>
            <Configuration.Section title="Events" description="Add your Cal.com event slug">
                {events.length < 4 && (
                    <>
                        <div className="flex gap-2 items-center">
                            <Input
                                disabled={!config.username || loading}
                                ref={slugInputRef}
                                placeholder="Event ID/Slug (eg. 15min/30min/secret)"
                            />
                            <Button
                                size={'lg'}
                                variant={'secondary'}
                                disabled={!config.username || loading}
                                onClick={async () => {
                                    if (!slugInputRef.current?.value) return
                                    setLoading(true)
                                    const eventSlug = slugInputRef.current.value.trim()
                                    if (!eventSlug.length) {
                                        setLoading(false)
                                        return
                                    }

                                    await fetchEventDetails(eventSlug)
                                    slugInputRef.current.value = ''
                                }}
                            >
                                {loading ? <LoaderIcon className="animate-spin" /> : 'ADD'}
                            </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {['15min', '30min'].map((eventSlug) => (
                                <Badge
                                    key={eventSlug}
                                    variant={
                                        eventSlugs.includes(eventSlug) ? 'secondary' : 'outline'
                                    }
                                    className={`${
                                        config.username && !eventSlugs.includes(eventSlug)
                                            ? 'cursor-pointer'
                                            : 'opacity-50'
                                    }`}
                                    role={
                                        config.username && !eventSlugs.includes(eventSlug)
                                            ? 'button'
                                            : undefined
                                    }
                                    aria-label={`${eventSlug} event type`}
                                    aria-disabled={
                                        !config.username || eventSlugs.includes(eventSlug)
                                    }
                                    onClick={() => {
                                        if (!config.username || eventSlugs.includes(eventSlug)) {
                                            return
                                        }
                                        return fetchEventDetails(eventSlug)
                                    }}
                                >
                                    {eventSlug}
                                </Badge>
                            ))}
                        </div>
                    </>
                )}

                {events.map((event, index) => (
                    <div
                        className="flex flex-row gap-2 justify-between items-center w-full h-full"
                        key={event.slug}
                    >
                        <div className="flex flex-row gap-2 justify-center items-center h-full">
                            <span className="flex flex-col justify-center items-center font-bold text-black bg-white rounded-full min-w-12 min-h-12">
                                # {index}
                            </span>
                            <span className="text-md">
                                {event.slug.length > 25
                                    ? event.slug.substring(0, 25) + '...'
                                    : event.slug}
                            </span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    updateConfig({
                                        events: events.filter((e) => e.slug !== event.slug),
                                    })
                                }
                            >
                                <TrashIcon />
                            </Button>
                        </div>
                    </div>
                ))}
            </Configuration.Section>

            <Configuration.Section
                title="Timezone"
                description="Choose your preferred timezone to display the event start time."
            >
                <Select
                    disabled={disableFields}
                    defaultValue={config.timezone ?? 'Europe/London'}
                    onChange={async (value) => {
                        if (!config.events.length) return

                        updateConfig({
                            timezone: value,
                        })
                    }}
                >
                    {timezoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </Configuration.Section>
            <Configuration.Section title="Gating">
                <div className="flex flex-row items-center justify-between gap-2 ">
                    <Label className="font-md" htmlFor="gating">
                        Enable Gating?
                    </Label>
                    <Switch
                        id="gating"
                        checked={enabledGating}
                        onCheckedChange={(enableGating) => {
                            updateConfig({ enableGating })
                        }}
                    />
                </div>

                {enabledGating && (
                    <div className="flex flex-col gap-2 w-full">
                        <h2 className="text-lg font-semibold">Poll Gating options</h2>
                        <GatingInspector
                            fid={fid}
                            config={config.gating}
                            onUpdate={(option) => {
                                updateConfig({
                                    gating: {
                                        ...config.gating,
                                        ...option,
                                    },
                                })
                            }}
                        />
                    </div>
                )}
            </Configuration.Section>
            <Configuration.Section
                title="Customization"
                description="Customize your frame's design"
            >
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Font</h2>
                    <FontFamilyPicker
                        defaultValue={config.fontFamily || 'Roboto'}
                        onSelect={(font) => {
                            updateConfig({
                                fontFamily: font,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Primary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.primaryColor || '#ffffff'}
                        setBackground={(value: string) =>
                            updateConfig({
                                primaryColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Secondary Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.secondaryColor || '#000000'}
                        setBackground={(value: string) =>
                            updateConfig({
                                secondaryColor: value,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Title Style</h2>
                    <FontStylePicker
                        currentFont={config?.fontFamily || 'Roboto'}
                        defaultValue={config?.titleStyle || 'normal'}
                        onSelect={(style) =>
                            updateConfig({
                                titleStyle: style,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Title Weight</h2>
                    <FontWeightPicker
                        currentFont={config.fontFamily || 'Roboto'}
                        defaultValue={config.titleWeight}
                        onSelect={(weight) =>
                            updateConfig({
                                titleWeight: weight,
                            })
                        }
                    />
                </div>
                <div className="flex flex-col gap-2 w-full max-md:gap-0">
                    <h2 className="text-lg font-semibold max-md:text-base">Background</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient', 'image']}
                        background={config.background || '#000000'}
                        setBackground={(e) =>
                            updateConfig({
                                background: e,
                            })
                        }
                        uploadBackground={async (base64String, contentType) => {
                            const { filePath } = await uploadImage({
                                base64String: base64String,
                                contentType: contentType,
                            })

                            return filePath
                        }}
                    />
                </div>
            </Configuration.Section>
        </Configuration.Root>
    )
}
