'use client'

import { Input } from '@/components/shadcn/Input'
import { useFrameConfig } from '@/sdk/hooks'
import { InfoIcon } from 'lucide-react'
import Link from 'next/link'
import SlideDesigner from './components/SlideDesigner'
import type { FramePressConfig, SlideConfig } from './config'
import { DEFAULT_SLIDES, INITIAL_BUTTONS } from './constants'

const FIGMA_PAT_HELP =
    'https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens'

export default function Inspector() {
    const [config, updateConfig] = useFrameConfig<FramePressConfig>()

    // Setup default slides if this is a new instance
    if (config.slides === undefined) {
        console.debug('Initializing slides...')
        updateConfig({
            ...config,
            slides: DEFAULT_SLIDES,
            nextSlideId: DEFAULT_SLIDES.length,
        })
    }

    const updateFigmaPAT = (updatedPAT: string) => {
        console.debug('Inspector::updateFigmaPAT()')
        updateConfig({
            ...config,
            figmaPAT: updatedPAT,
        })
    }

    // REFACTOR using a dictionary would be simpler?
    const updateSlide = (updatedSlide: SlideConfig) => {
        console.debug(`Inspector::updateSlide(${updatedSlide.id})`)

        const updatedSlides = config.slides?.map((slide) =>
            slide.id == updatedSlide.id ? updatedSlide : slide
        )

        updateConfig({
            ...config,
            slides: updatedSlides,
        })
    }

    const addSlide = (index: number, position: 'above' | 'below') => {
        console.debug(`Inspector::addSlide(${index}, ${position})`)

        const newSlide: SlideConfig = {
            id: config.nextSlideId.toString(),
            aspectRatio: '1:1',
            textLayers: {},
            buttons: INITIAL_BUTTONS,
        }

        const updatedSlides = [...config.slides]

        if (position === 'above') {
            updatedSlides.splice(index, 0, newSlide)
        } else if (position === 'below') {
            updatedSlides.splice(index + 1, 0, newSlide)
        }

        updateConfig({
            ...config,
            slides: updatedSlides,
            nextSlideId: config.nextSlideId + 1,
        })
    }

    const removeSlide = (index: number) => {
        console.debug(`Inspector::removeSlide(${index})`)

        const updatedSlides = [...config.slides]

        if (index >= 0 && index < updatedSlides.length) {
            updatedSlides.splice(index, 1)
            updateConfig({
                ...config,
                slides: updatedSlides,
            })
        } else {
            console.error('Invalid index:', index)
        }
    }

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        console.debug(`Inspector::moveSlide(${index}, ${direction})`)

        const updatedSlides = [...config.slides]

        if (index < 0 || index >= updatedSlides.length) {
            console.error('Invalid index:', index)
            return
        }

        const swapIndex = direction === 'up' ? index - 1 : index + 1

        if (swapIndex < 0 || swapIndex >= updatedSlides.length) {
            console.error('Cannot move slide out of bounds:', swapIndex)
            return
        }

        // Swap the slides
        const temp = updatedSlides[index]
        updatedSlides[index] = updatedSlides[swapIndex]
        updatedSlides[swapIndex] = temp

        updateConfig({
            ...config,
            slides: updatedSlides,
        })
    }

    const buttonTargets = config.slides
        ?.filter((slide) => slide.title !== undefined) // Filter out slides without a title
        .map((slide) => ({
            id: slide.id,
            title: slide.title as string,
        }))

    return (
        <div className="w-full h-full space-y-4 pr-2">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Figma Personal Access Token (PAT)</h2>
                <p className="text-sm text-muted-foreground">
                    A token is required to display your Figma designs.
                </p>
                <div className="flex items-center space-x-2">
                    <div>{config.figmaPAT ? '✅' : '❌'}</div>
                    <Input
                        id="token"
                        type="password"
                        placeholder={
                            config.figmaPAT ? 'Figma PAT is saved' : 'Enter your Figma PAT'
                        }
                        className="flex-1"
                        onChange={(e) => updateFigmaPAT(e.target.value)}
                    />
                    <Link href={FIGMA_PAT_HELP} className="flex" target="_blank">
                        <InfoIcon className="mr-2 h-4 w-4 self-center" />
                        Learn more
                    </Link>
                </div>
            </div>

            {config.slides?.map((slideConfig, index) => (
                <SlideDesigner
                    key={slideConfig.id}
                    slideConfig={slideConfig}
                    figmaPAT={config.figmaPAT}
                    isFirstSlide={index == 0}
                    isSecondSlide={index == 1}
                    isLastSlide={index == config.slides.length - 1}
                    buttonTargets={buttonTargets}
                    onUpdate={(updatedSlideConfig) => updateSlide(updatedSlideConfig)}
                    onMoveUp={() => moveSlide(index, 'up')}
                    onMoveDown={() => moveSlide(index, 'down')}
                    onAddAbove={() => addSlide(index, 'above')}
                    onAddBelow={() => addSlide(index, 'below')}
                    onDelete={() => removeSlide(index)}
                />
            ))}
        </div>
    )
}
