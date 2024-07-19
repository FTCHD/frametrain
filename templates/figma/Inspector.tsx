'use client'

import { useFrameConfig, useFramePreview } from '@/sdk/hooks'
import { ArrowBigLeftDash, ArrowBigRightDash, KeySquare, Trash2 } from 'lucide-react'
import SlideEditor from './components/SlideEditor'
import type { FramePressConfig, SlideConfig } from './Config'
import { DEFAULT_SLIDES, INITIAL_BUTTONS } from './constants'
import FigmaTokenEditor from './components/FigmaTokenEditor'
import { Button } from '@/components/shadcn/Button'
import { useMemo, useState } from 'react'
import { FigmaView } from './views/FigmaView'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<FramePressConfig>()
    const [editingFigmaPAT, setEditFigmaPAT] = useState(config.figmaPAT === undefined)
    const [currentSlideIndex, setSlideIndex] = useState(0)
    const [_, setPreviewData] = useFramePreview()

    // Setup default slides if this is a new instance
    if (config.slides === undefined) {
        console.debug('Initializing slides...')
        updateConfig({
            ...config,
            slides: DEFAULT_SLIDES,
            nextSlideId: DEFAULT_SLIDES.length,
        })
    }

    // Selected slide
    const selectedSlide = useMemo(() => {
        return config.slides[currentSlideIndex]
    }, [config, currentSlideIndex])

    // Configuration updates
    function updateFigmaPAT(updatedPAT: string) {
        console.debug('Inspector::updateFigmaPAT()')
        updateConfig({
            ...config,
            figmaPAT: updatedPAT,
        })
    }

    function updateSlide(updatedSlide: SlideConfig) {
        console.debug(`Inspector::updateSlide(id=${updatedSlide.id})`)

        const updatedSlides = config.slides.with(currentSlideIndex, updatedSlide)

        updateConfig({ slides: updatedSlides })
    }

    function addSlide() {
        console.debug('Inspector::addSlide()')

        const newSlide: SlideConfig = {
            id: config.nextSlideId.toString(),
            title: '',
            description: '',
            aspectRatio: '1:1',
            textLayers: {},
            buttons: INITIAL_BUTTONS,
        }

        const updatedSlides = config.slides.concat(newSlide)

        updateConfig({
            slides: updatedSlides,
            nextSlideId: config.nextSlideId + 1,
        })

        setSlideIndex(updatedSlides.length - 1)
    }

    function removeSlide() {
        console.debug(`Inspector::removeSlide(${currentSlideIndex})`)

        const updatedSlides = config.slides
        updatedSlides.splice(currentSlideIndex, 1)
        setSlideIndex((c) => Math.max(0, c - 1))
        updateConfig({ slides: updatedSlides })
    }

    function swapSlide(direction: 'left' | 'right') {
        console.debug(`Inspector::moveSlide(${currentSlideIndex}, ${direction})`)

        const updatedSlides = [...config.slides]

        if (currentSlideIndex < 0 || currentSlideIndex === updatedSlides.length - 1) {
            console.error('Invalid index:', currentSlideIndex)
            return
        }

        const swapIndex = direction === 'left' ? currentSlideIndex - 1 : currentSlideIndex + 1

        const temp = updatedSlides[currentSlideIndex]
        updatedSlides[currentSlideIndex] = updatedSlides[swapIndex]
        updatedSlides[swapIndex] = temp

        updateConfig({ slides: updatedSlides })
    }

    const buttonTargets = config.slides
        ?.filter((slide) => slide.title !== undefined) // Filter out slides without a title
        .map((slide) => ({
            id: slide.id,
            title: slide.title as string,
        }))

    const canMoveLeft = currentSlideIndex != 0 // not the first slide
    const canMoveRight = currentSlideIndex != config.slides.length - 1 // not the last slide
    const canDelete = config.slides.length != 1 // must always be one slide visible

    return (
        <div className="w-full h-full space-y-4 pl-2 pr-2">
            {editingFigmaPAT && (
                <FigmaTokenEditor
                    figmaPAT={config.figmaPAT}
                    onChange={updateFigmaPAT}
                    onCancel={() => setEditFigmaPAT(false)}
                />
            )}

            {!editingFigmaPAT && (
                <>
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-row items-center justify-end gap-2">
                            <Button onClick={() => setEditFigmaPAT(true)}>
                                <KeySquare className="mr-1" />
                                Figma PAT
                            </Button>
                        </div>
                        <div className="flex flex-row items-center justify-end gap-2">
                            <Button onClick={() => swapSlide('left')} disabled={!canMoveLeft}>
                                <ArrowBigLeftDash /> Move left
                            </Button>
                            <Button onClick={() => swapSlide('right')} disabled={!canMoveRight}>
                                Move right <ArrowBigRightDash />
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!canDelete}
                                onClick={() => removeSlide()}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {config.slides.map((slideConfig, index) => (
                            <div
                                key={slideConfig.id}
                                onClick={() => {
                                    setSlideIndex(index)
                                    setPreviewData({
                                        handler: 'slide',
                                        buttonIndex: 0,
                                        inputText: '',
                                        params: `slideId=${slideConfig.id}`,
                                    })
                                }}
                                className={`w-40 h-40 flex items-center justify-center p-2 border-[1px] rounded-md cursor-pointer select-none ${
                                    currentSlideIndex === index
                                        ? 'border-highlight'
                                        : 'border-input'
                                }`}
                            >
                                <FigmaView slideConfig={slideConfig} />
                            </div>
                        ))}
                        <div
                            onClick={() => addSlide()}
                            className="w-40 h-40 flex items-center justify-center p-2 border-input border-[1px] rounded-md cursor-pointer"
                        >
                            <span className="text-4xl">+</span>
                        </div>
                    </div>

                    {selectedSlide && (
                        <SlideEditor
                            key={selectedSlide.id}
                            slideConfig={selectedSlide}
                            figmaPAT={config.figmaPAT}
                            buttonTargets={buttonTargets}
                            onUpdate={(updatedSlideConfig) => updateSlide(updatedSlideConfig)}
                        />
                    )}
                </>
            )}
        </div>
    )
}
