'use client'
import { ColorPicker, Input } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Config } from '.'
import getBeehiivArticle from './utils'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [loading, setLoading] = useState(false)

    const urlInputRef = useRef<HTMLInputElement>(null)
    const imgSizeInputRef = useRef<HTMLInputElement>(null)
    const pagesFontSizeInputRef = useRef<HTMLInputElement>(null)
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

    const urlInputHandler = async (url: string) => {
        if (url === config.article?.url) return
        if (url === '') {
            updateConfig({ article: null })
            return
        }

        if (!/^(https?:\/\/[^\s]+)/.test(url)) {
            toast.error('Please enter a valid beehiv article URL')
            return
        }

        try {
            setLoading(true)
            const newArticle = await getBeehiivArticle(url)
            updateConfig({ article: newArticle })
            console.log(newArticle)
            toast.success('Successfully fetched the beehiv article')
        } catch (e) {
            console.error('beehiiv', e)
            toast.error('Please enter a valid beehiv article URL')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Configuration.Root>
            <Configuration.Section title="Beehiiv Article URL">
                <div className="flex flex-row w-full gap-2">
                    <Input
                        className="py-2 text-lg"
                        placeholder="https://blog.beehiv.com/..."
                        ref={urlInputRef}
                        defaultValue={config.article?.url ?? ''}
                        onChange={(e) => urlInputHandler(e.target.value)}
                    />
                    {loading && <LoaderIcon className="animate-spin" />}
                </div>
            </Configuration.Section>
            <Configuration.Section title="Cover Options">
                <label className="flex gap-x-4 items-center">
                    <Input
                        className="w-4 h-4"
                        name="textPosition"
                        type="radio"
                        defaultChecked={!config.textPosition}
                        onChange={() =>
                            updateConfig({
                                textPosition: textPositionOverlayRef.current?.checked,
                            })
                        }
                    />
                    <p className="text-lg">Place the text below the image</p>
                </label>
                <label className="flex gap-x-4 items-center">
                    <Input
                        className="w-4 h-4"
                        name="textPosition"
                        type="radio"
                        defaultChecked={config.textPosition}
                        ref={textPositionOverlayRef}
                        onChange={() =>
                            updateConfig({
                                textPosition: textPositionOverlayRef.current?.checked,
                            })
                        }
                    />
                    <p className="text-lg">Place the text over the image</p>
                </label>
                <label className="mt-4 flex gap-x-4 items-center">
                    <Input
                        className="w-4 h-4"
                        defaultChecked={config.hideTitleAuthor}
                        type="checkbox"
                        ref={hideTitleAuthorRef}
                        onChange={() =>
                            updateConfig({
                                hideTitleAuthor: hideTitleAuthorRef.current?.checked,
                            })
                        }
                    />
                    <h2 className="text-lg">Hide the Title & Author</h2>
                </label>
                <label className="mt-1 flex gap-x-4 items-center">
                    <Input
                        className="w-4 h-4"
                        type="checkbox"
                        defaultChecked={config.showLinkOnAllPages}
                        ref={linkOnAllPagesRef}
                        onChange={() =>
                            updateConfig({
                                showLinkOnAllPages: linkOnAllPagesRef.current?.checked,
                            })
                        }
                    />
                    <div className="flex flex-col">
                        <h2 className="text-lg">Show link to article on every frame</h2>
                        <p className="text-sm text-gray-400">uncheck for last page only</p>
                    </div>
                </label>
            </Configuration.Section>
            <Configuration.Section title="Cover Styles">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.coverBgColor || 'black'}
                        setBackground={(value) => updateConfig({ coverBgColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.coverTextColor || 'white'}
                        setBackground={(value) => updateConfig({ coverTextColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Image Size</h2>
                    <Input
                        className="w-full"
                        type="number"
                        defaultValue={config.imageSize ?? 40}
                        ref={imgSizeInputRef}
                        onBlur={() => updateConfig({ imageSize: imgSizeInputRef.current?.value })}
                    />
                    <p className="text-sm text-gray-400">
                        Enter a percent value and test (frame size limit is 256kb!)
                    </p>
                </div>
            </Configuration.Section>
            <Configuration.Section title="Page Styles">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.pagesBgColor || 'white'}
                        setBackground={(value) => updateConfig({ pagesBgColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.pagesTextColor || 'black'}
                        setBackground={(value) => updateConfig({ pagesTextColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Font Size</h2>
                    <Input
                        className="w-full"
                        type="number"
                        defaultValue={config.pagesFontSize ?? 18}
                        ref={pagesFontSizeInputRef}
                        onBlur={() =>
                            updateConfig({ pagesFontSize: pagesFontSizeInputRef.current?.value })
                        }
                    />
                </div>
            </Configuration.Section>
        </Configuration.Root>
    )
}
