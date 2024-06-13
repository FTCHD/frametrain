'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Config } from '.'
import getMediumArticle from './utils'
import { ColorPicker } from '@/sdk/components'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [loading, setLoading] = useState(false)

    const urlInputRef = useRef<HTMLInputElement>(null)
    const imgSizeInputRef = useRef<HTMLInputElement>(null)
    const linkOnAllPagesRef = useRef<HTMLInputElement>(null)
    const hideTitleAuthorRef = useRef<HTMLInputElement>(null)

    // keep the url input updated with the article URL
    useEffect(() => {
        if (!urlInputRef.current) return
        if (!urlInputRef.current.value) return

        urlInputRef.current.value = config.article?.url ?? ''
    }, [config.article])

    // handler for the article URL input
    const urlInputHandler = (e: any) => {

        const url = e.target.value

        // Accept only valid Medium URLs - later on we can adapt to other platforms
        if (!/^https:\/\/(\w+\.)?medium\.com\//.test(url)) {
            return
        }

        renderMediumArticle(url)
    }

    const renderMediumArticle = async (url:string) => {

        setLoading(true)

        // don't rely on config.maxCharsPerPage as it may not have been updated yet
        const newArticle = await getMediumArticle(url)
        updateConfig({ article: newArticle })
        console.log(newArticle)

        setLoading(false)
    }

    return (
        <div className="h-full flex flex-col gap-10">
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex gap-2 items-center">
                    <h1 className="text-2xl font-bold">URL</h1>
                    { loading && <LoaderIcon className="animate-spin" /> }
                </div>
                <div className="flex flex-col gap-2">
                    <Input
                        className="py-2 text-lg"
                        placeholder="https://medium.com/..."
                        ref={urlInputRef}
                        defaultValue={ config.article?.url ?? '' }
                        onChange={urlInputHandler}
                    />
                </div>

                <h1 className="text-2xl font-bold">Cover Style</h1>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Background Colour</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.bgColor || 'black'}
                        setBackground={(value) => updateConfig({ bgColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Colour</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className='flex flex-col'>
                        <h2 className="text-lg font-semibold">Image size - percent</h2>
                        <p>check that the frame size limit is not exceeded</p>
                    </div>
                    <Input
                        className="w-full"
                        type="number"
                        defaultValue={ config.imageSize ?? 20 }
                        ref={imgSizeInputRef}
                        onBlur={() => updateConfig({ imageSize: imgSizeInputRef.current?.value })}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <div className='flex flex-col'>
                        <h2 className="text-lg font-bold">Don't show Title/Author on the cover</h2>
                    </div>
                    <Input
                        className="w-full"
                        defaultChecked={ config.hideTitleAuthor }
                        type="checkbox"
                        ref={hideTitleAuthorRef} 
                        onChange={() => updateConfig({ hideTitleAuthor: hideTitleAuthorRef.current?.checked })}
                    />
                </div>

                <h1 className="text-2xl font-bold">Options</h1>
                <div className="flex gap-2 items-center">
                    <div className='flex flex-col'>
                        <h2 className="text-lg font-bold">Show link to article on every frame</h2>
                        <p>uncheck for last page only</p>
                    </div>
                    <Input
                        className="w-full"
                        type="checkbox"
                        defaultChecked={ config.showLinkOnAllPages }
                        ref={linkOnAllPagesRef} 
                        onChange={() => updateConfig({ showLinkOnAllPages: linkOnAllPagesRef.current?.checked })}
                    />
                </div>
            </div>
        </div>
    )
}