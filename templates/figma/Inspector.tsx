'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/shadcn/AlertDialog'
import { Button } from '@/components/shadcn/Button'
import { Checkbox } from '@/components/shadcn/Checkbox'
import { Label } from '@/components/shadcn/Label'
import { useFrameConfig, useFramePreview } from '@/sdk/hooks'
import { ArrowBigLeftDash, ArrowBigRightDash, KeySquare, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import type { FramePressConfig, SlideConfig, TextLayerConfigs } from './Config'
import FigmaTokenEditor from './components/FigmaTokenEditor'
import SlideEditor from './components/SlideEditor'
import { DEFAULT_SLIDES, INITIAL_BUTTONS } from './constants'
import FontConfig from './utils/FontConfig'
import { FigmaView } from './views/FigmaView'
import { dimensionsForRatio } from '@/sdk/constants'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<FramePressConfig>()
    const [_, setPreviewData] = useFramePreview()
	
    const [editingFigmaPAT, setEditingFigmaPAT] = useState(config.figmaPAT === undefined)
    const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
	
	const [figmaUnderstood, setFigmaUnderstood] = useLocalStorage('figmaUnderstood', false)
	const figmaUnderstoodRef = useRef(figmaUnderstood)

    // Slide selection
    function previewSlide(id: string) {
        console.debug(`previewSlide(${id})`)
        setPreviewData({
            handler: 'slide',
            buttonIndex: 0,
            inputText: '',
            params: `slideId=${id}`,
        })
    }

    // Configuration updates
    function updateFigmaPAT(updatedPAT: string) {
        console.debug('Inspector::updateFigmaPAT()')
        setEditingFigmaPAT(false)
        updateConfig({
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

        // We don't update the selected slide because there is a delay
        // between the config being updated on the backend, which
        // makes the preview out of sync.
    }

    function removeSlide() {
        console.debug(`Inspector::removeSlide(${selectedSlideIndex})`)

        const updatedSlides = config.slides
        updatedSlides.splice(selectedSlideIndex, 1)

        const newCurrentSlide = config.slides[selectedSlideIndex - 1]
        previewSlide(newCurrentSlide.id)
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
        previewSlide(newCurrentSlide.id)
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
    }, [config.slides, identifyFontsUsed])

    // Setup default slides if this is a new instance
    useEffect(() => {
        if (config.slides === undefined) {
            console.debug('Initializing slides...')
            updateConfig({
                slides: DEFAULT_SLIDES,
                nextSlideId: DEFAULT_SLIDES.length,
            })
        }
    }, [config, updateConfig])

    // Button targets == slides with a Title
    const buttonTargets = useMemo(
        () =>
            config.slides
                ?.filter((slide) => slide.title !== undefined) // Filter out slides without a title
                .map((slide) => ({
                    id: slide.id,
                    title: slide.title as string,
                })),
        [config.slides]
    )

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
                            <Button onClick={() => setEditingFigmaPAT(true)} variant={'secondary'}>
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
                                onClick={removeSlide}
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
                                    setSelectedSlideIndex(index)
                                    previewSlide(slideConfig.id)
                                }}
                                className={`w-40 h-40 flex items-center justify-center mr-1 border-[1px] rounded-md cursor-pointer select-none ${
                                    selectedSlideIndex === index
                                        ? 'border-highlight'
                                        : 'border-input'
                                }`}
                            >
                                <div
                                    style={{
                                        'transform':
                                            slideConfig.aspectRatio == '1:1'
                                                ? 'scale(0.245)'
                                                : 'scale(0.130)',
                                        // Handle the case where no image has been configured but we need a min-width
                                        ...(!slideConfig.baseImagePaths
                                            ? {
                                                  'width':
                                                      slideConfig.aspectRatio == '1:1'
                                                          ? dimensionsForRatio['1/1'].width
                                                          : dimensionsForRatio['1.91/1'].height,
                                              }
                                            : {}),
                                        'overflow': 'clip',
                                    }}
                                >
                                    <FigmaView slideConfig={slideConfig} />
                                </div>
                            </div>
                        ))}

                        {figmaUnderstood ? (
                            <div
                                className="w-40 h-40 flex items-center justify-center mr-1 border-input border-[1px] rounded-md cursor-pointer"
                                onClick={addSlide}
                            >
                                <span className="text-4xl">+</span>
                            </div>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <div className="w-40 h-40 flex items-center justify-center mr-1 border-input border-[1px] rounded-md cursor-pointer">
                                        <span className="text-4xl">+</span>
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Resolution Notice</AlertDialogTitle>
                                        <AlertDialogDescription className="flex flex-col gap-4">
                                            The Figma URL entered must lead to an artboard/section
                                            that is either 630x630 or 1200x630 pixels in size.
                                            <div className="flex flex-row items-center gap-2">
                                                <Checkbox
                                                    id="figmaUnderstood"
                                                    onCheckedChange={(e) =>
                                                        (figmaUnderstoodRef.current = e === true)
                                                    }
                                                />
                                                <Label htmlFor="figmaUnderstood">
                                                    Don't show again.
                                                </Label>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Back</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                addSlide()

                                                if (figmaUnderstoodRef.current) {
                                                    setFigmaUnderstood(true)
                                                }
                                            }}
                                        >
                                            Understood
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>

                    {config.slides?.[selectedSlideIndex] && (
                        <SlideEditor
                            key={config.slides[selectedSlideIndex].id}
                            slideConfig={config.slides[selectedSlideIndex]}
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
