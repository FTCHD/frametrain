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
    const textPositionOverlayRef = useRef<HTMLInputElement>(null)
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

    // handler for the textPosition radio group
    const textPositionHandler = (e: any) => {
        const textPosition = e.target.value
        console.log('textPosition', textPosition)
        //updateConfig({ textPosition: textPosition })
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
        <div className="h-full flex flex-col gap-10 mr-12">
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex gap-2 items-center">
                    <h1 className="text-2xl font-bold">Medium Article URL</h1>
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
                    <h2 className="text-lg">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.bgColor || 'black'}
                        setBackground={(value) => updateConfig({ bgColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Image Size</h2>
                    <Input
                        className="w-full"
                        type="number"
                        defaultValue={ config.imageSize ?? 40 }
                        ref={imgSizeInputRef}
                        onBlur={() => updateConfig({ imageSize: imgSizeInputRef.current?.value })}
                    />
                    <p className="text-sm text-gray-400">Enter a percent value and test (frame size limit is 256kb!)</p>
                </div>

                <h1 className="text-2xl font-bold">Options</h1>
                <div className="flex flex-col">
                    <label className='flex gap-x-4 items-center'>
                        <Input
                            className="w-4 h-4"
                            name="textPosition"
                            type="radio"
                            defaultChecked = { true }
                            onChange={() => updateConfig({ textPosition: textPositionOverlayRef.current?.checked })}
                        />
                        <p className="text-lg">Place the text below the image</p>
                    </label>
                    <label className='flex gap-x-4 items-center'>
                        <Input
                            className="w-4 h-4"
                            name="textPosition"
                            type="radio"
                            defaultChecked={ false }
                            ref={textPositionOverlayRef}
                            onChange={() => updateConfig({ textPosition: textPositionOverlayRef.current?.checked })}
                        />
                        <p className="text-lg">Place the text over the image</p>
                    </label>                        
                    <label className='mt-4 flex gap-x-4 items-center'>
                        <Input
                            className="w-4 h-4"
                            defaultChecked={ config.hideTitleAuthor }
                            type="checkbox"
                            ref={hideTitleAuthorRef} 
                            onChange={() => updateConfig({ hideTitleAuthor: hideTitleAuthorRef.current?.checked })}
                        />
                        <h2 className="text-lg">Hide the Title & Author</h2>
                    </label>
                    <label className='mt-1 flex gap-x-4 items-center'>
                        <Input
                            className="w-4 h-4" 
                            type="checkbox"
                            defaultChecked={ config.showLinkOnAllPages }
                            ref={linkOnAllPagesRef} 
                            onChange={() => updateConfig({ showLinkOnAllPages: linkOnAllPagesRef.current?.checked })}
                        />
                        <div className="flex flex-col">
                            <h2 className="text-lg">Show link to article on every frame</h2>
                            <p className="text-sm text-gray-400">uncheck for last page only</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}