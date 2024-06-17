'use client'

import { useFrameConfig, useFrameId } from '@/sdk/hooks'
import type { FramePressConfig, SlideConfig } from './Config'
import { DEFAULT_SLIDES, INITIAL_BUTTONS } from './Constants'
import SlideDesigner from './components/SlideDesigner'
import { Label } from '@/components/shadcn/InputLabel'
import { Input } from '@/components/shadcn/Input'

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

    type AddedSlidePosition = 'above' | 'below'

    const addSlide = (index: number, position: AddedSlidePosition) => {
        console.debug(`Inspector::addSlide(${index}, ${position})`)

        const newSlide: SlideConfig = {
            id: config.nextSlideId.toString(),
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

    const buttonTargets = config.slides
        ?.filter((slide) => slide.title !== undefined) // Filter out slides without a title
        .map((slide) => ({
            id: slide.id,
            title: slide.title as string,
        }))

    return (
        <div className="w-full h-full space-y-4">
            {/* <p>{JSON.stringify(config)}</p> */}

            <div className="grid w-full space-y-2">
                <Label htmlFor="token">
                    Figma Personal Access Token (<a href={FIGMA_PAT_HELP}>help 🔗</a>)
                </Label>
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
                </div>
            </div>

            {config.slides?.map((slideConfig, index) => (
                <SlideDesigner
                    key={slideConfig.id}
                    figmaPAT={config.figmaPAT}
                    slideConfig={slideConfig}
                    buttonTargets={buttonTargets}
                    onUpdate={(updatedSlideConfig) => updateSlide(updatedSlideConfig)}
                    onAddAbove={() => addSlide(index, 'above')}
                    onAddBelow={() => addSlide(index, 'below')}
                    onDelete={() => removeSlide(index)}
                />
            ))}

            <div>
                FramePress was made with 💜 by <a href="https://warpcast.com/rjs">rjs</a>
            </div>
        </div>
    )
}
