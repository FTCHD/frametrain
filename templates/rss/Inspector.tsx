'use client'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useUploadImage } from '@/sdk/hooks'
import { useEffect, useRef } from 'react'
import type { Config } from '.'
import { ColorPicker, FontFamilyPicker } from '@/sdk/components'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()

    const rssUrlRef = useRef<HTMLInputElement>(null)
    const uploadImage = useUploadImage()

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
                        onChange={async (e) => {
                            const rssUrl = e.target.value

                            if (!rssUrl.length) {
                                updateConfig({ rssUrl: null })
                                return
                            }

                            updateConfig({ rssUrl })
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h2 className="text-lg font-semibold">Font Family</h2>
                <FontFamilyPicker
                    defaultValue={config.fontFamily}
                    onSelect={(fontFamily) => {
                        updateConfig({
                            fontFamily,
                        })
                    }}
                />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Title & Description Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.primaryColor || '#ffffff'}
                    setBackground={(value) => updateConfig({ primaryColor: value })}
                />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Date & Pagination Color</h2>
                <ColorPicker
                    className="w-full"
                    background={config.secondaryColor || '#ffe83f'}
                    setBackground={(value) => updateConfig({ secondaryColor: value })}
                />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Cover Background</h2>
                <ColorPicker
                    className="w-full"
                    enabledPickers={['solid', 'gradient', 'image']}
                    background={config.coverBackground || '#000000'}
                    setBackground={(coverBackground) => updateConfig({ coverBackground })}
                    uploadBackground={async (base64String, contentType) => {
                        const { filePath } = await uploadImage({
                            base64String: base64String,
                            contentType: contentType,
                        })

                        return filePath
                    }}
                />
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Post Background</h2>
                <ColorPicker
                    className="w-full"
                    enabledPickers={['solid', 'gradient', 'image']}
                    background={config.pageBackground || '#000000'}
                    setBackground={(pageBackground) => updateConfig({ pageBackground })}
                    uploadBackground={async (base64String, contentType) => {
                        const { filePath } = await uploadImage({
                            base64String: base64String,
                            contentType: contentType,
                        })

                        return filePath
                    }}
                />
            </div>
        </div>
    )
}
