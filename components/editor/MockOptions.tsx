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
    const [simulatedFid, setSimulatedFid] = useState(Number.parseInt(fid))

    useEffect(() => {
        if (mockOptions.fid > 0) return
        if (mockOptions.fid === simulatedFid) return
        setMockOptions((prev) => ({ ...prev, fid: simulatedFid }))

        return () => {
            // reset fid as the only default mock option
            setMockOptions(() => ({
                recasted: false,
                liked: false,
                follower: false,
                following: false,
                fid: simulatedFid,
            }))
        }
    }, [mockOptions, setMockOptions, simulatedFid])

    return (
        <DropdownMenu open={open}>
            <DropdownMenuTrigger asChild={true} onClick={() => setOpen(!open)}>
                <Button variant="outline" className="text-lg" size={'lg'}>
                    Simulate
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" onInteractOutside={() => setOpen(false)}>
                <DropdownMenuLabel>Simulate Interactions</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="w-full">Recasted</span>
                        <Switch
                            checked={mockOptions.recasted}
                            onCheckedChange={(recasted) => {
                                setMockOptions((prev) => ({ ...prev, recasted }))
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="w-full">Liked</span>
                        <Switch
                            checked={mockOptions.liked}
                            onCheckedChange={(liked) => {
                                setMockOptions((prev) => ({ ...prev, liked }))
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
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
                        <User className="mr-2 h-4 w-4" />
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

                <DropdownMenuItem className="hover:bg-none">
                    <div className="flex flex-col w-full h-full">
                        <span>FID:</span>
                        <Input
                            type="number"
                            defaultValue={simulatedFid}
                            className="hover:border"
                            onChange={async (e) => {
                                e.preventDefault()
                                const fid = Number.parseInt(e.target.value)

                                setTimeout(() => {
                                    setMockOptions((prev) => ({ ...prev, fid }))
                                    setSimulatedFid(fid)
                                }, 1500)
                            }}
                        />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
