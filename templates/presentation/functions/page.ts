'use server'
import type { BuildFrameData, FrameActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '../'
import { renderCustomButtons } from '../utils'
import CoverView from '../views/Cover'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: {},
    params: any
): Promise<BuildFrameData> {
    const buttonIndex = body?.untrustedData?.buttonIndex

    const currentPage: number = params?.page ? Number(params.page) : 0

    const clickedButton = config.slides[currentPage].buttons![buttonIndex - 1]

    if (!clickedButton.target) {
        throw new FrameError('Invalid slide')
    }

    const slideIndex = Number.parseInt(clickedButton.target)

    if (slideIndex > config.slides.length - 1) {
        throw new FrameError('Invalid slide')
    }
	
    const slide = config.slides[slideIndex]

	const contentFont = await loadGoogleFontAllVariants(slide.content?.font || 'Roboto')
    const titleFont = await loadGoogleFontAllVariants(slide.title?.font || 'Inter')

    const buttons = await renderCustomButtons(slide['buttons']!)

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: slide.aspectRatio || '1:1',
        component: CoverView(slide),
        handler: 'page',
        params: { page: slideIndex },
    }
}
