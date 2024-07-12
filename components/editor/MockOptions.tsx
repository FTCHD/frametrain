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
import { mockOptionsAtom } from '@/lib/store'
import { useAtom } from 'jotai'
import { User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '../shadcn/Input'

export default function MockOptions({ fid }: { fid: string }) {
    const [open, setOpen] = useState(false)
    const [mockOptions, setMockOptions] = useAtom(mockOptionsAtom)

    useEffect(() => {
        // we reset the mock options
        setMockOptions(() => ({
            recasted: false,
            liked: false,
            follower: false,
            following: false,
            fid: Number.parseInt(fid),
        }))

        // we reset again so when we visit a Frame that doesn't require validation, this doesn't stay in memory
        // otherwise it would send it when calling simulateCall
        return () => {
            setMockOptions(() => ({
                recasted: false,
                liked: false,
                follower: false,
                following: false,
                fid: 0,
            }))
        }
    }, [setMockOptions, fid])

    return (
        <DropdownMenu open={open}>
            <DropdownMenuTrigger asChild={true} onClick={() => setOpen(!open)}>
                <Button variant="outline" className="text-lg opacity-0 md:opacity-100" size={'lg'}>
                    Simulate
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" onInteractOutside={() => setOpen(false)}>
                <DropdownMenuLabel>Simulate Interactions</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 w-4 h-4" />
                        <span className="w-full">Recasted</span>
                        <Switch
                            checked={mockOptions.recasted}
                            onCheckedChange={(recasted) => {
                                setMockOptions((prev) => ({ ...prev, recasted }))
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 w-4 h-4" />
                        <span className="w-full">Liked</span>
                        <Switch
                            checked={mockOptions.liked}
                            onCheckedChange={(liked) => {
                                setMockOptions((prev) => ({ ...prev, liked }))
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 w-4 h-4" />
                        <span className="w-full">Following</span>
                        <Switch
                            checked={mockOptions.following}
                            onCheckedChange={(following) => {
                                setMockOptions((prev) => ({
                                    ...prev,
                                    following,
                                }))
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 w-4 h-4" />
                        <span className="w-full">Follower</span>
                        <Switch
                            checked={mockOptions.follower}
                            onCheckedChange={(follower) => {
                                setMockOptions((prev) => ({ ...prev, follower }))
                            }}
                        />
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <span className="w-full">FID</span>
                    <Input
                        defaultValue={mockOptions.fid}
                        onChange={async (e) => {
                            const fid = Number.parseInt(e.target.value)
                            setMockOptions((prev) => ({ ...prev, fid }))
                        }}
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
