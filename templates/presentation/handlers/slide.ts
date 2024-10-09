'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Slide } from '..'

export default async function slide({
    body,
    config,
    storage,
    params,
}: {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    const { currentSlide: currentSlideIndex } = params as {
        currentSlide: number
    }

    const currentSlide = config?.slides?.[currentSlideIndex]

    if (!currentSlide) {
        throw new FrameError('Slide not configured')
    }

    console.log('fid', body.interactor.fid)
    console.log('currentSlide', currentSlide)

    const tappedButtonIndex = body.tapped_button.index - 1
    const currentSlideButtons = currentSlide.buttons
    const tappedButton = currentSlideButtons[tappedButtonIndex]

    console.log('tappedButtonIndex', tappedButtonIndex)
    console.log('currentSlideButtons', currentSlideButtons)
    console.log('tappedButton', tappedButton)

    if (tappedButton.type === 'frame') {
        return {
            frame: tappedButton.target,
        }
    }

    // next slide index is based on the button pressed
    // which could also be a frame so another return
    const nextSlideIndex = tappedButton.target as keyof typeof config.slides

    const nextSlide = config?.slides?.[nextSlideIndex] as Slide

    if (!nextSlide) {
        throw new FrameError('Invalid slide index')
    }

    const fonts = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons: nextSlide.buttons.map((button) =>
            button.type === 'link'
                ? {
                      label: button.text,
                      action: 'link',
                      target: button.target,
                  }
                : {
                      label: button.text,
                  }
        ),
        aspectRatio: nextSlide.aspectRatio,
        fonts: fonts,
        image: nextSlide.imageUrl,
        handler: 'slide',
        params: {
            currentSlide: nextSlideIndex,
        },
    }
}
