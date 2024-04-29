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

export default function MockOptions() {
    const [open, setOpen] = useState(false)
    const [mockOptions, setMockOptions] = useAtom(mockOptionsAtom)

    useEffect(() => {
        // we reset the mock options
        setMockOptions([])

        // undefined so when we visit a Frame that doesn't require validation, this doesn't stay in memory
        return () => setMockOptions(undefined)
    }, [setMockOptions])

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
                            checked={mockOptions?.includes('recasted')}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setMockOptions([...(mockOptions || []), 'recasted'])
                                } else {
                                    setMockOptions(
                                        mockOptions?.filter((option) => option !== 'recasted')
                                    )
                                }
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="w-full">Liked</span>
                        <Switch
                            checked={mockOptions?.includes('liked')}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setMockOptions([...(mockOptions || []), 'liked'])
                                } else {
                                    setMockOptions(
                                        mockOptions?.filter((option) => option !== 'liked')
                                    )
                                }
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="w-full">Following</span>
                        <Switch
                            checked={mockOptions?.includes('following')}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setMockOptions([...(mockOptions || []), 'following'])
                                } else {
                                    setMockOptions(
                                        mockOptions?.filter((option) => option !== 'following')
                                    )
                                }
                            }}
                        />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="w-full">Follower</span>
                        <Switch
                            checked={mockOptions?.includes('follower')}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setMockOptions([...(mockOptions || []), 'follower'])
                                } else {
                                    setMockOptions(
                                        mockOptions?.filter((option) => option !== 'follower')
                                    )
                                }
                            }}
                        />
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                {/* <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>FID</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}