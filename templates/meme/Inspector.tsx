'use client'
import { Button, Input, Select } from '@/sdk/components'
import { useFrameConfig } from '@/sdk/hooks'
import { Configuration } from '@/sdk/inspector'
import { LoaderIcon } from 'lucide-react'
import ms from 'ms'
import { unstable_cache } from 'next/cache'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Config } from '.'
import { createMeme, getMemeTemplates } from './common'

type Meme = {
    id: string
    name: string
    url: string
    positions: number
}

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<Config>()
    const [memeTemplates, setMemeTemplates] = useState<Meme[]>([])
    const [selectedMeme, setSelectedMeme] = useState<Meme | undefined>(undefined)
    const [generating, setGenerating] = useState(false)
    const [captions, setCaptions] = useState<string[]>([])

    useEffect(() => {
        const fetchMemeTemplates = unstable_cache(
            async () => {
                try {
                    const result = await getMemeTemplates()
                    const memes = result.map((meme) => ({
                        id: meme.id,
                        name: meme.name,
                        url: meme.url,
                        positions: meme.box_count,
                    }))
                    setMemeTemplates(memes)
                } catch (e) {
                    const error = e as Error
                    toast.remove()
                    toast.error(error.message)
                }
            },
            [],
            {
                revalidate: ms('7d') / 1000,
            }
        )

        fetchMemeTemplates()
    }, [])

    return (
        <Configuration.Root>
            <Configuration.Section title="Meme Templates" description="Select a meme template">
                <Select
                    disabled={generating}
                    defaultValue={selectedMeme?.id}
                    placeholder="Select meme template"
                    onChange={(e) => {
                        const meme = memeTemplates.find((meme) => meme.id === e)

                        if (meme) setSelectedMeme(meme)
                    }}
                >
                    {memeTemplates.map((meme) => (
                        <option key={meme.id} value={meme.id}>
                            {meme.name}
                        </option>
                    ))}
                </Select>
            </Configuration.Section>

            <Configuration.Section title="Thumbnail" description="Preview your meme template">
                {selectedMeme ? (
                    <div className="flex flex-row flex-wrap gap-4">
                        <img src={selectedMeme.url} width={200} height={200} alt="PDF Slide" />
                    </div>
                ) : (
                    <h3 className="text-lg font-semibold">No meme selected</h3>
                )}
            </Configuration.Section>

            <Configuration.Section title="Captions" description="Add your meme captions">
                {selectedMeme ? (
                    <>
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: selectedMeme?.positions || 1 }).map((_, i) => (
                                <Input
                                    key={i}
                                    defaultValue={captions[i]}
                                    disabled={!selectedMeme || generating}
                                    className="text-lg"
                                    placeholder={`Caption ${i + 1}`}
                                    onChange={(e) => {
                                        const newCaptions = [...captions]
                                        newCaptions[i] = e.target.value
                                        setCaptions(newCaptions)
                                    }}
                                />
                            ))}
                        </div>

                        <Button
                            disabled={!selectedMeme || generating}
                            onClick={async () => {
                                if (!selectedMeme) return
                                if (captions.length !== selectedMeme.positions) return

                                setGenerating(true)

                                createMeme(captions, selectedMeme.id)
                                    .then(async (memeUrl) => {
                                        updateConfig({
                                            memeUrl,
                                            template: {
                                                id: selectedMeme.id,
                                                name: selectedMeme.name,
                                                url: selectedMeme.url,
                                                captions,
                                            },
                                        })
                                        setSelectedMeme(undefined)
                                        setCaptions([])
                                    })
                                    .catch((err) => {
                                        const error = err as Error
                                        toast.remove()
                                        toast.error(error.message)
                                    })
                                    .finally(() => {
                                        setGenerating(false)
                                    })
                            }}
                            size="lg"
                            className="w-full bg-border hover:bg-secondary-border text-primary"
                        >
                            {generating ? <LoaderIcon className="animate-spin" /> : 'Create'}
                        </Button>
                    </>
                ) : (
                    <h3 className="text-lg font-semibold">No meme selected</h3>
                )}
            </Configuration.Section>

            <Configuration.Section
                title="Aspect Ratio"
                description="Change the aspect ratio of your meme"
            >
                {config.memeUrl ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-base font-medium">Aspect Ratio</h3>
                            <Select
                                defaultValue={config.aspectRatio}
                                onChange={(aspectRatio) => updateConfig({ aspectRatio })}
                            >
                                <option value="1:1">1:1 (Square)</option>
                                <option value="1.91:1">1.91:1 (Widescreen)</option>
                            </Select>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() =>
                                updateConfig({
                                    memeUrl: undefined,
                                    template: undefined,
                                    aspectRatio: '1:1',
                                })
                            }
                        >
                            Reset Meme
                        </Button>
                    </div>
                ) : (
                    <h3 className="text-lg font-semibold">No meme generated</h3>
                )}
            </Configuration.Section>
        </Configuration.Root>
    )
}
