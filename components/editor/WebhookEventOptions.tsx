'use client'
import { Button } from '@/components/shadcn/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/shadcn/DropdownMenu'
import { Switch } from '@/components/shadcn/Switch'
import { updateFrameWebhooks } from '@/lib/frame'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '../shadcn/Input'

export default function WebhookEventOptions({
    events,
    webhooks,
    id,
    setUpdating,
}: {
    events: string[]
    webhooks: { [key: string]: string }
    id: string
    setUpdating: (updating: boolean) => void
}) {
    const [open, setOpen] = useState(false)
    const [webhookEvents, setWebhookEvents] = useState<
        { event: string; url?: string; enabled: boolean }[]
    >(
        webhooks
            ? events.map((event) => ({
                  event,
                  url: webhooks[event],
                  enabled: !!webhooks[event],
              }))
            : []
    )

    const updateWebhook = useDebouncedCallback(async (event: string, url?: string) => {
        setUpdating(true)
        await updateFrameWebhooks(id, { event, url })
        setUpdating(false)
    }, 1000)

    return (
        <DropdownMenu open={open}>
            <DropdownMenuTrigger asChild={true} onClick={() => setOpen(!open)}>
                <Button variant="secondary" className="text-lg" size={'lg'}>
                    Webhooks
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" onInteractOutside={() => setOpen(false)}>
                <DropdownMenuLabel className="space-y-4">
                    <h4 className="leading-none">Webhook events</h4>
                    <div className="text-sm font-normal text-muted-foreground">
                        Enable or disable the reception of webhook events.
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    {events.map((event) => (
                        <DropdownMenuItem className="flex-col gap-4" key={event}>
                            <div className="flex items-start w-full">
                                <span className="w-full">
                                    {event[0].toUpperCase()}
                                    {event.slice(1)}
                                </span>
                                <Switch
                                    checked={
                                        webhookEvents.find((wh) => wh.event === event)?.enabled
                                    }
                                    onCheckedChange={async (value) => {
                                        setWebhookEvents((prev) =>
                                            prev.map((prevWh) =>
                                                prevWh.event === event
                                                    ? { ...prevWh, enabled: value }
                                                    : prevWh
                                            )
                                        )

                                        if (webhooks[event] && !value) await updateWebhook(event)
                                    }}
                                />
                            </div>
                            {webhookEvents.find((wh) => wh.event === event)?.enabled && (
                                <Input
                                    type="url"
                                    placeholder="Enter Webhook URL here"
                                    className="w-full"
                                    defaultValue={
                                        webhookEvents.find((wh) => wh.event === event)?.url
                                    }
                                    onChange={async (e) => updateWebhook(event, e.target.value)}
                                />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
