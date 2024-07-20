'use client'
import { Button } from '@/components/shadcn/Button'
import { Input } from '@/components/shadcn/Input'
import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import { useEffect, useState } from 'react'
import type { Config } from '.'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { LoaderIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createMeme, getMemes } from './utils'

type Meme = {
    id: string
    name: string
    url: string
    positions: number
}

export default function Inspector() {
    const frameId = useFrameId()
    const [config, updateConfig] = useFrameConfig<Config>()
    const [memeTemplates, setMemeTemplates] = useState<Meme[]>([])
    const [selectedMeme, setSelectedMeme] = useState<Meme | undefined>(undefined)
    const [generating, setGenerating] = useState(false)
    const [captions, setCaptions] = useState<string[]>([])

    useEffect(() => {
        function setLocalStorage(key: string, item: any) {
            localStorage.setItem(`${frameId}-${key}`, JSON.stringify(item))
        }

        function getLocalStorage<T>(key: string) {
            const item = localStorage.getItem(`${frameId}-${key}`)
            if (!item) return null
            return JSON.parse(item) as T
        }

        function fetchMemeTemplatesFromLocalStorage() {
            const cachePeriod = getLocalStorage<number>('imgflip-cache-time')
            const cachedMemes = getLocalStorage<Meme[]>('imgflip-memes')

            if (!(cachePeriod && cachedMemes) || Date.now() - cachePeriod > 1000 * 60 * 60 * 24) {
                return null
            }
            return cachedMemes
        }

        async function fetchMemeTemplates() {
            try {
                const cachedMemes = fetchMemeTemplatesFromLocalStorage()
                if (cachedMemes) {
                    setMemeTemplates(cachedMemes)
                    return
                }
                const result = await getMemes()
                const memes = result.map((meme) => ({
                    id: meme.id,
                    name: meme.name,
                    url: meme.url,
                    positions: meme.box_count,
                }))
                setMemeTemplates(memes)
                setLocalStorage('imgflip-cache-time', Date.now())
                setLocalStorage('imgflip-memes', memes)
            } catch (e) {
                const error = e as Error
                toast.remove()
                toast.error(error.message)
            }
        }

        fetchMemeTemplates()
    }, [frameId])

    return (
        <div className="w-full h-full space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Templates</h2>

                <Select
                    disabled={generating}
                    defaultValue={selectedMeme?.id}
                    onValueChange={(e) => {
                        const meme = memeTemplates.find((meme) => meme.id === e)

                        if (meme) setSelectedMeme(meme)
                    }}
                >
                    <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select a meme template" />
                    </SelectTrigger>
                    <SelectContent>
                        {memeTemplates.map((meme) => (
                            <SelectItem key={meme.id} value={meme.id}>
                                {meme.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedMeme ? (
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-lg font-semibold">Thumbnail</h2>
                        </div>
                        <div className="flex flex-row flex-wrap gap-4">
                            <img src={selectedMeme.url} width={200} height={200} alt="PDF Slide" />
                        </div>
                    </div>
                    <div className="flex flex-col h-full">
                        <h2 className="text-lg font-semibold">Captions</h2>

                        <div className="flex flex-col gap-2 h-full">
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
                    </div>
                </div>
            ) : null}

            {config.memeUrl ? (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-base font-medium">Aspect Ratio</h3>
                        <Select
                            defaultValue={config.aspectRatio}
                            onValueChange={(aspectRatio) => updateConfig({ aspectRatio })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select aspect ratio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                <SelectItem value="1.91:1">1.91:1 (Widescreen)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="destructive"
                        className="w-full "
                        onClick={() =>
                            updateConfig({
                                memeUrl: undefined,
                                template: undefined,
                                aspectratio: undefined,
                            })
                        }
                    >
                        Reset Meme
                    </Button>
                </div>
            ) : null}
        </div>
    )
}
