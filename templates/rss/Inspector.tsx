'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { useEffect, useRef } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const rssUrlRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!rssUrlRef.current) return
        if (!config.rssUrl) return

        rssUrlRef.current.value = config.rssUrl
    }, [config.rssUrl])

    return (
        <div className=" h-full flex flex-col gap-10">
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">RSS Feed URL</h2>
                    <Input
                        className="py-2 text-lg"
                        ref={rssUrlRef}
                        onChange={(e) => {
                            const rssUrl = e.target.value

                            if (!rssUrl.length) {
                                return
                            }
                            updateConfig({ rssUrl })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
