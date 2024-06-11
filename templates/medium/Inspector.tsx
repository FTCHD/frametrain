'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Config } from '.'
import getMediumArticle from './utils'
import { ColorPicker } from '@/sdk/components'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const [loading, setLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)

    const linkOnAllPagesRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!inputRef.current) return
        if (!inputRef.current.value) return

        inputRef.current.value = config.article?.url ?? ''
    }, [config.article])

    const renderMediumArticle = async (e: any) => {
        const url = e.target.value
        if (!/^https:\/\/(\w+\.)?medium\.com\//.test(url)) {
            return
        }

        setLoading(true)
        
        updateConfig({ article: await getMediumArticle(url) })
        console.log(config.article)

        setLoading(false)
    }

    return (
        <div className="h-full flex flex-col gap-10">
            <div className="w-full h-full flex flex-col gap-5">
                <h1 className="text-2xl font-bold">URL<span>{ loading ?? <LoaderIcon className="animate-spin" /> }</span></h1>
                <div className="flex flex-col gap-2">
                    <Input
                        className="py-2 text-lg"
                        placeholder="https://medium.com/..."
                        ref={inputRef} 
                        onChange={renderMediumArticle}
                    />
                </div>

                <h1 className="text-2xl font-bold">Cover Style</h1>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Colour</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Background Image Mode</h2>
                    <Select
                        defaultValue={'normal'}
                        onValueChange={(value) => updateConfig({ bgBlendMode: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Background Image Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={'normal'}>Normal</SelectItem>
                            <SelectItem value={'lighten'}>Lighten</SelectItem>
                            <SelectItem value={'darken'}>Darken</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <h1 className="text-2xl font-bold">Options</h1>
                <div className="flex gap-2 items-center">
                    <div className='flex flex-col'>
                        <h2 className="text-lg font-bold">Show link to article on every frame</h2>
                        <p>unchecked: show only on last page</p>
                    </div>
                    <Input
                        className="w-full"
                        type="checkbox"
                        ref={linkOnAllPagesRef} 
                        onChange={() => updateConfig({ showLinkOnAllPages: linkOnAllPagesRef.current?.checked })}
                    />
                </div>


            </div>
        </div>
    )
}