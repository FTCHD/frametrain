"use client";
import { Button } from "@/components/shadcn/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/DropdownMenu";
import { Switch } from "@/components/shadcn/Switch";
import { useState } from "react";

export default function WebhookEventOptions({ events }: { events: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild={true} onClick={() => setOpen(!open)}>
        <Button variant="outline" className="text-lg" size={"lg"}>
          Webhooks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onInteractOutside={() => setOpen(false)}
      >
        <DropdownMenuLabel>Webhook events</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {events.map((event) => (
            <DropdownMenuItem key={event}>
              <span className="w-full">{event}</span>
              <Switch
                checked={!!event}
                onCheckedChange={(value) => {
                  // setMockOptions((prev) => ({ ...prev, [event]: value }))
                }}
              />
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
  );
}
