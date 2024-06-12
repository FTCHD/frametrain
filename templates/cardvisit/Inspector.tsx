'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useRef } from 'react'
import type { Config } from '.'
import { corsFetch } from '@/sdk/scrape'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()

    const { githubLink } = config

    const displayLabelInputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="w-full h-full space-y-4">
            <p>{JSON.stringify(config)}</p>

            <h3 className="text-lg font-semibold">Input github repo</h3>

            <p>{githubLink}</p>

            <div className="flex flex-col gap-2 ">
                <Input
                    className="text-lg"
                    placeholder="Input something"
                    ref={displayLabelInputRef}
                />
                <Button
                    onClick={async() => {
                        if (!displayLabelInputRef.current?.value) return

                        const ownerAndRepo = displayLabelInputRef.current.value.split('/')
                        const githubInfo = await corsFetch(`https://api.github.com/repos/${ownerAndRepo[ownerAndRepo.length-2]}/${ownerAndRepo[ownerAndRepo.length-1]}`)

                        const infoObject = JSON.parse(githubInfo as string)
                        updateConfig({
                            githubLink: displayLabelInputRef.current.value,
                            full_name: infoObject.full_name,
                            stargazers_count: infoObject.stargazers_count,
                            watchers_count: infoObject.watchers_count,
                            forks_count: infoObject.forks_count,
                            description: infoObject.description,
                            owner_avatar_url: infoObject.owner?.avatar_url,
                            owner_login: infoObject.owner?.login
                        })

                        displayLabelInputRef.current.value = ''
                    }}
                    className="w-full bg-border hover:bg-secondary-border text-primary"
                >
                    Add github
                </Button>
            </div>

            <Button
                variant="destructive"
                className="w-full "
                onClick={() => updateConfig({ githubLink: '' })}
            >
                Delete
            </Button>
        </div>
    )
}
