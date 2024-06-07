'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { corsFetch } from '@/sdk/scrape'
import { useEffect, useRef } from 'react'
import type { Config } from '.'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!inputRef.current) return
        if (!config.discourseLink) return

        inputRef.current.value = config.discourseLink
    }, [config.discourseLink])

    async function handleInputChange(e: any) {
        let unparsedLink = e.target.value

        if (unparsedLink.endsWith('/')) {
            unparsedLink = unparsedLink.slice(0, -1)
        }

        const discourseLink = unparsedLink

        const discourseDomain = 'https://' + discourseLink.replace('https://', '').split('/')[0]

        const jsonData = await corsFetch(`${discourseLink}.json`).then((res) =>
            JSON.parse(res ?? '')
        )

        const title = jsonData.title
        const postCount = jsonData.posts_count

        updateConfig({ discourseLink, discourseDomain, title, postCount })
    }

    return (
        <div className="h-full w-full space-y-4">
            <p>{JSON.stringify(config)}</p>
            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-bold">Discourse Link</h2>
                <Input className="py-2 text-lg" ref={inputRef} onChange={handleInputChange} />
                <p className="text-sm text-muted-foreground">
                    https://ethereum-magicians.org/t/eip-77...
                </p>
            </div>
        </div>
    )
}
