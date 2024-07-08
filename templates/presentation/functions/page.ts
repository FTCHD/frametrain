'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import CoverView from '../views/Cover'
import { renderCustomButtons } from './initial'
import type { Config } from '../types'
import type { State } from '..'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const clickedButton = body?.untrustedData?.buttonIndex

    /* Pagination */
    const maxPage = Math.max(config.slides.length, 1)
    let buttons: FrameButtonMetadata[] = []

    let currentPage: number
    let newPage: number

    if (params?.page) currentPage = Number(params.page)
    else currentPage = 0

    newPage = currentPage
    const customButton = config.slides[currentPage]?.['buttons']?.[clickedButton - 1]

    // Update page for pagination button click
    if (!customButton) {
        // Next Page
        if (clickedButton === 2) newPage += 1
        // Next Page
        else if (clickedButton === 1 && currentPage === 0) newPage += 1
        // Previous Page
        else if (clickedButton === 1 && currentPage === maxPage - 1) newPage -= 1
        // Previous Page
        else if (clickedButton === 1) newPage -= 1
    }

    // A custom navigate button is clicked
    // We have to find which custom button is clicked and where it navigates
    else if (customButton?.slideID) {
        newPage = Math.max(Math.min(customButton.slideID, config.slides.length), 0)
    }

    const contentFont = await loadGoogleFontAllVariants(
        config.slides[newPage].content?.font || 'Roboto'
    )
    const titleFont = await loadGoogleFontAllVariants(config.slides[newPage].title?.font || 'Inter')

    if (!config.slides[newPage]?.['buttons']) {
        if (newPage > 0) {
            buttons.push({
                label: '←',
            })
        }
        if (newPage < maxPage - 1) {
            buttons.push({
                label: '→',
            })
        }
    } else {
        buttons = await renderCustomButtons(config.slides[newPage]['buttons']!)
    }

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: config.slides[newPage].aspect || '1:1',
        component: CoverView(config.slides[newPage]),
        functionName: 'page',
        params: { page: newPage },
    }
}
