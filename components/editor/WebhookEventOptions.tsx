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
import { useState } from 'react'
import { Label } from '../shadcn/InputLabel'
import { Input } from '../shadcn/Input'
import { useDebouncedCallback } from 'use-debounce'
import { updateFrameWebhooks } from '@/lib/frame'

export default function WebhookEventOptions(props: {
    events: string[]
    webhooks: { [key: string]: string }
    id: string
    setUpdating: (updating: boolean) => void
}) {
    const [open, setOpen] = useState(false)
    const [webhookEvents, setWebhookEvents] = useState<
        { event: string; url?: string; enabled: boolean }[]
    >(
        props.webhooks
            ? props.events.map((event) => ({
                  event,
                  url: props.webhooks[event],
                  enabled: !!props.webhooks[event],
              }))
            : []
    )

    const updateWebhook = useDebouncedCallback(async (event: string, url?: string) => {
        props.setUpdating(true)
        await updateFrameWebhooks(props.id, { event, url })
        props.setUpdating(false)
    }, 1000)

    return (
        <DropdownMenu open={open}>
            <DropdownMenuTrigger asChild={true} onClick={() => setOpen(!open)}>
                <Button variant="outline" className="text-lg" size={'lg'}>
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
                    {props.events.map((event) => (
                        <DropdownMenuItem className="flex-col gap-4" key={event}>
                            <div className="flex items-start w-full">
                                <span className="w-full">{event}</span>
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

                                        if (!value) await updateWebhook(event)
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

                {/* <DropdownMenuItem>
                    <span className="w-full">FID</span>
                    <Input
                        defaultValue={mockOptions.fid}
                        onChange={async (e) => {
                            const fid = Number.parseInt(e.target.value)
                            setMockOptions((prev) => ({ ...prev, fid }))
                        }}
                    />
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
