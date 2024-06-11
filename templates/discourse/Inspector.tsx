'use client'
import { Input } from '@/components/shadcn/Input'
import { ColorPicker, FontFamilyPicker } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { corsFetch } from '@/sdk/scrape'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
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

        if (!unparsedLink) {
            updateConfig({ discourseLink: '', discourseDomain: '', discourseJson: '', title: '' })
            return
        }

        if (unparsedLink.endsWith('/')) {
            unparsedLink = unparsedLink.slice(0, -1)
        }

        const discourseLink = unparsedLink

        const discourseDomain = 'https://' + discourseLink.replace('https://', '').split('/')[0]

        const discourseJson = discourseLink + '.json'

        const thread = await corsFetch(discourseJson)
            .then((res) => JSON.parse(res!))
            .catch(() => {
                toast.remove()
                toast.error('Error fetching thread')
                return
            })

        const title = thread.title

        updateConfig({ discourseLink, discourseDomain, discourseJson, title })
    }

    return (
        <div className=" h-full flex flex-col gap-10">
            <div className="w-full h-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Discourse Thread</h2>
                    <Input className="py-2 text-lg" ref={inputRef} onChange={handleInputChange} />
                    <p className="text-sm text-muted-foreground">
                        https://ethereum-magicians.org/t/eip-77...
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Background Color</h2>
                    <ColorPicker
                        className="w-full"
                        enabledPickers={['solid', 'gradient']}
                        background={config.backgroundColor || 'black'}
                        setBackground={(value) => updateConfig({ backgroundColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Font</h2>
                    <FontFamilyPicker
                        defaultValue={config.textFont || 'Lato'}
                        onSelect={(font) => {
                            updateConfig({ textFont: font })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Text Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.textColor || 'white'}
                        setBackground={(value) => updateConfig({ textColor: value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Highlight Font</h2>
                    <FontFamilyPicker
                        defaultValue={config.highlightFont || 'Urbanist'}
                        onSelect={(font) => {
                            updateConfig({ highlightFont: font })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Highlight Color</h2>
                    <ColorPicker
                        className="w-full"
                        background={config.highlightColor || 'orange'}
                        setBackground={(value) => updateConfig({ highlightColor: value })}
                    />
                </div>
            </div>
        </div>
    )
}
