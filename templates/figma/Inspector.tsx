'use client'

import { useFrameConfig, useFramePreview } from '@/sdk/hooks'
import { ArrowBigLeftDash, ArrowBigRightDash, KeySquare, Trash2 } from 'lucide-react'
import SlideEditor from './components/SlideEditor'
import type { FramePressConfig, SlideConfig, TextLayerConfigs } from './Config'
import { DEFAULT_SLIDES, INITIAL_BUTTONS, INITIAL_SLIDE_ID } from './constants'
import FigmaTokenEditor from './components/FigmaTokenEditor'
import { Button } from '@/components/shadcn/Button'
import { useEffect, useState } from 'react'
import { FigmaView } from './views/FigmaView'
import FontConfig from './utils/FontConfig'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<FramePressConfig>()
    const [editingFigmaPAT, setEditingFigmaPAT] = useState(config.figmaPAT === undefined)
    const [_, setPreviewData] = useFramePreview()

    const [selectedSlideId, setSelectedSlideId] = useState(INITIAL_SLIDE_ID)
    const [selectedSlide, setSelectedSlide] = useState<SlideConfig>()
    const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)

    // Setup default slides if this is a new instance
    if (config.slides === undefined) {
        console.debug('Initializing slides...')
        updateConfig({
            ...config,
            slides: DEFAULT_SLIDES,
            nextSlideId: DEFAULT_SLIDES.length,
        })
    }

    // Slide selection
    function selectSlide(id: string) {
        console.debug(`selectSlide(${id})`)

        const index = findSlide(id)
        const slide = index >= 0 ? config.slides[index] : undefined

        setSelectedSlideId(id)
        setSelectedSlideIndex(index)
        setSelectedSlide(slide)

        console.debug(`selectedSlideIndex updated to ${index} (${id})`)
        if (slide) {
            console.debug(`setPreviewData(${id})`)
            // Don't use selectedSlideId -- it might not be saved in the config
            // yet due to the delay that debouncing creates. selectedSlide is always
            // guaranteed to be in the config!
            setPreviewData({
                handler: 'slide',
                buttonIndex: 0,
                inputText: '',
                params: `slideId=${id}`,
            })
        }
    }

    function findSlide(id: string) {
        return config.slides ? config?.slides.findIndex((slide) => slide.id == id) : -1
    }

    // Configuration updates
    function updateFigmaPAT(updatedPAT: string) {
        console.debug('Inspector::updateFigmaPAT()')
        setEditingFigmaPAT(false)
        updateConfig({
            ...config,
            figmaPAT: updatedPAT,
        })
    }

    function updateSlide(updatedSlide: SlideConfig) {
        console.debug(`Inspector::updateSlide(${updatedSlide.id})`)

        const updatedSlides = config.slides.map((existingSlide) =>
            existingSlide.id == updatedSlide.id ? updatedSlide : existingSlide
        )

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

        selectSlide(newSlide.id)
    }

    function removeSlide() {
        console.debug(`Inspector::removeSlide(${selectedSlideId})`)

        const updatedSlides = config.slides
        updatedSlides.splice(selectedSlideIndex, 1)

        const newCurrentSlide = config.slides[selectedSlideIndex - 1]
        selectSlide(newCurrentSlide.id)
        updateConfig({ slides: updatedSlides })
    }

    function swapSlide(direction: 'left' | 'right') {
        console.debug(`Inspector::moveSlide(${selectedSlideIndex}, ${direction})`)

        const updatedSlides = [...config.slides]

        const swapIndex = direction === 'left' ? selectedSlideIndex - 1 : selectedSlideIndex + 1

        const temp = updatedSlides[selectedSlideIndex]
        updatedSlides[selectedSlideIndex] = updatedSlides[swapIndex]
        updatedSlides[swapIndex] = temp

        const newCurrentSlide = updatedSlides[swapIndex]
        selectSlide(newCurrentSlide.id)
        updateConfig({ slides: updatedSlides })
    }

    // Accurate font previews require us to identify & load fonts used into <head>
    function identifyFontsUsed(textLayers: TextLayerConfigs): FontConfig[] {
        const fonts = new Set<FontConfig>()
        for (const layer of Object.values(textLayers)) {
            if (layer.fontFamily) {
                const fontConfig = new FontConfig(
                    layer.fontFamily,
                    layer.fontWeight,
                    layer.fontStyle
                )
                fonts.add(fontConfig)
            }
        }
        return Array.from(fonts)
    }

    // Must run after rendering as it modifies the document <head>
    useEffect(() => {
        if (!config.slides) return
        for (const slide of config.slides) {
            const fonts = identifyFontsUsed(slide.textLayers)
            for (const fontConfig of fonts) {
                if (!loadedFonts.has(fontConfig.key)) {
                    addGoogleFontIntoHtmlHead(fontConfig)
                    loadedFonts.add(fontConfig.key)
                }
            }
        }
    })

    // Handle the case of a new slide - we have to wait until the slide is in the config
    // selectedSlideId will be something other than the INITIAL_SLIDE_ID, and
    // selectedSlideIndex will be -1 indicating that the slide wasn't available
    // the last time we tried. This must run after the render since it changes state.
    // Also handle the case of a new template instance.
    useEffect(() => {
        if (config.figmaPAT && (selectedSlideIndex == -1 || selectedSlide === undefined)) {
            // If we can find the slide, that means we can now properly identify the index
            if (findSlide(selectedSlideId) >= 0) {
                selectSlide(selectedSlideId)
            }
        }
    })

    // Button targets == slides with a Title
    const buttonTargets = config.slides
        ?.filter((slide) => slide.title !== undefined) // Filter out slides without a title
        .map((slide) => ({
            id: slide.id,
            title: slide.title as string,
        }))

    // Slide operation buttons
    const canMoveLeft = selectedSlideIndex != 0 // not the first slide
    const canMoveRight = selectedSlideIndex != config.slides?.length - 1 // not the last slide
    const canDelete = config.slides?.length != 1 // must always be one slide visible

    return (
        <div className="w-full h-full space-y-4 pl-2 pr-2">
            {editingFigmaPAT && (
                <FigmaTokenEditor
                    figmaPAT={config.figmaPAT}
                    onChange={updateFigmaPAT}
                    onCancel={() => setEditingFigmaPAT(false)}
                />
            )}

            {!editingFigmaPAT && (
                <>
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-row items-center justify-end gap-2">
                            <Button onClick={() => setEditingFigmaPAT(true)}>
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
                    <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'auto' }}>
                        {config.slides.map((slideConfig, index) => (
                            <div
                                key={slideConfig.id}
                                onClick={() => {
                                    selectSlide(slideConfig.id)
                                }}
                                className={`w-40 h-40 flex items-center justify-center mr-1 border-[1px] rounded-md cursor-pointer select-none ${
                                    selectedSlideIndex === index
                                        ? 'border-highlight'
                                        : 'border-input'
                                }`}
                            >
                                <div style={{ 'transform': 'scale(0.245)' }}>
                                    <FigmaView slideConfig={slideConfig} />
                                </div>
                            </div>
                        ))}
                        <div
                            onClick={() => addSlide()}
                            className="w-40 h-40 flex items-center justify-center mr-1 border-input border-[1px] rounded-md cursor-pointer"
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

/*
 * Fonts
 *
 * We need to load Google fonts into the page otherwise the text on the slide
 * preview will be wrong. An alternative would be to render the preview via the
 * frame handler, but this has performance and complexity trade-offs.
 *
 * We keep track of which fonts we've already added into <head> to avoid the
 * list of <meta> growing uncontrollably.
 *
 */
const loadedFonts = new Set<string>()
function addGoogleFontIntoHtmlHead(fontConfig: FontConfig) {
    if (loadedFonts.has(fontConfig.key)) {
        console.debug(`loadGoogleFont(${fontConfig.key}): already loaded`)
        return
    }

    const link = document.createElement('link')
    const requestFontName = fontConfig.fontFamily.replace(' ', '+')
    const fontWeightValue = fontConfig.fontWeight as number
    const italicValue = fontConfig.fontStyle === 'italic' ? '1' : '0'
    link.href = `https://fonts.googleapis.com/css2?family=${requestFontName}:ital,wght@${italicValue},${fontWeightValue}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    loadedFonts.add(fontConfig.key)
    console.debug(`addGoogleFontIntoHtmlHead(${fontConfig.key}): loaded`)
}
