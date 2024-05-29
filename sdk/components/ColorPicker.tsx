'use client'

import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/Popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/Tabs'
import { cn } from '@/lib/shadcn'
import { Paintbrush } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

const solids = [
    '#E2E2E2',
    '#ff75c3',
    '#ffa647',
    '#ffe83f',
    '#9fff5b',
    '#70e2ff',
    '#cd93ff',
    '#09203f',
]

const gradients = [
    'linear-gradient(to top left,#accbee,#e7f0fd)',
    'linear-gradient(to top left,#d5d4d0,#d5d4d0,#eeeeec)',
    'linear-gradient(to top left,#000000,#434343)',
    'linear-gradient(to top left,#09203f,#537895)',
    'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
    'linear-gradient(to top left,#f953c6,#b91d73)',
    'linear-gradient(to top left,#ee0979,#ff6a00)',
    'linear-gradient(to top left,#F00000,#DC281E)',
    'linear-gradient(to top left,#00c6ff,#0072ff)',
    'linear-gradient(to top left,#4facfe,#00f2fe)',
    'linear-gradient(to top left,#0ba360,#3cba92)',
    'linear-gradient(to top left,#FDFC47,#24FE41)',
    'linear-gradient(to top left,#8a2be2,#0000cd,#228b22,#ccff00)',
    'linear-gradient(to top left,#40E0D0,#FF8C00,#FF0080)',
    'linear-gradient(to top left,#fcc5e4,#fda34b,#ff7882,#c8699e,#7046aa,#0c1db8,#020f75)',
    'linear-gradient(to top left,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)',
]

const images = [
    'url(https://images.unsplash.com/photo-1688822863426-8c5f9b257090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2532&q=90)',
]

export function ColorPicker({
    background,
    setBackground,
    className,
    enabledPickers = ['solid'],
    defaults = {
        solids,
        gradients,
        images,
    },
    uploadBackground,
}: {
    background: string
    setBackground: (background: string) => void
    className?: string
    enabledPickers?: string[]
    defaults?: {
        solids: string[]
        gradients: string[]
        images: string[]
    }
    uploadBackground?: (
        base64String: string,
        contentType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
    ) => Promise<string | undefined>
}) {
    const defaultTab = useMemo(() => {
        if (background.includes('url')) return 'image'
        if (background.includes('gradient')) return 'gradient'
        return 'solid'
    }, [background])
	
	const backgroundRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!backgroundRef.current) return
        backgroundRef.current.value = background
    }, [background])

    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[220px] justify-start text-left font-normal',
                        !background && 'text-muted-foreground',
                        className
                    )}
                >
                    <div className="flex gap-2 items-center w-full">
                        {background ? (
                            <div
                                className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                                style={{ background }}
                            />
                        ) : (
                            <Paintbrush className="w-4 h-4" />
                        )}
                        <div className="flex-1 truncate">
                            {background ? background : 'Pick a color'}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            {/* set to loosely match the Inspector width of 40% */}
            <PopoverContent className="w-[30dvw]">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="mb-4 w-full">
                        {enabledPickers.includes('solid') && (
                            <TabsTrigger className="flex-1" value="solid">
                                Solid
                            </TabsTrigger>
                        )}
                        {enabledPickers.includes('gradient') && (
                            <TabsTrigger className="flex-1" value="gradient">
                                Gradient
                            </TabsTrigger>
                        )}
                        {enabledPickers.includes('image') && (
                            <TabsTrigger className="flex-1" value="image">
                                Image
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="solid" className="flex flex-wrap gap-1 mt-0">
                        {defaults.solids.map((s) => (
                            <div
                                key={s}
                                style={{ background: s }}
                                className="w-6 h-6 rounded-md cursor-pointer active:scale-105"
                                onClick={() => setBackground(s)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="gradient" className="mt-0">
                        <div className="flex flex-wrap gap-1 mb-2">
                            {defaults.gradients.map((s) => (
                                <div
                                    key={s}
                                    style={{ background: s }}
                                    className="w-6 h-6 rounded-md cursor-pointer active:scale-105"
                                    onClick={() => setBackground(s)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-0">
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            {defaults.images.map((s) => (
                                <div
                                    key={s}
                                    style={{ backgroundImage: s }}
                                    className="w-full h-12 bg-center bg-cover rounded-md cursor-pointer active:scale-105"
                                    onClick={() => setBackground(s)}
                                />
                            ))}
                        </div>

                        {uploadBackground && (
                            <Input
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                type="file"
                                placeholder="Pick an image"
                                title="Pick an image"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const reader = new FileReader()
                                        reader.readAsDataURL(e.target.files[0])

                                        const base64String = (await new Promise((resolve) => {
                                            reader.onload = () => {
                                                const base64String = (
                                                    reader.result as string
                                                ).split(',')[1]
                                                resolve(base64String)
                                            }
                                        })) as string

                                        const contentType = e.target.files[0].type as
                                            | 'image/png'
                                            | 'image/jpeg'
                                            | 'image/gif'
                                            | 'image/webp'

                                        const filePath = await uploadBackground(
                                            base64String,
                                            contentType
                                        )

                                        if (filePath) {
                                            setBackground(
                                                `url(${process.env.NEXT_PUBLIC_CDN_HOST}/${filePath})`
                                            )
                                        }
                                    }
                                }}
                            />
                        )}
                    </TabsContent>
                </Tabs>

                <Input
                    ref={backgroundRef}
                    defaultValue={background}
                    className="col-span-2 mt-4 h-8"
                    onChange={(e) => setBackground(e.currentTarget.value)}
                />
            </PopoverContent>
        </Popover>
    )
}
