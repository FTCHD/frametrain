'use server'
import type { BuildFrameData, FrameActionPayload, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, State } from '..'
import CoverView from '../views/Cover'

export default async function page(
    body: FrameActionPayload,
    config: Config,
    state: State,
    params: any
): Promise<BuildFrameData> {
    const clickedButton = body?.untrustedData?.buttonIndex

    /* Pagination */
    const buttons: FrameButtonMetadata[] = []
    const maxPage = Math.max(config.slides.length, 1)

    let currentPage: number

    if (params?.page) currentPage = Number(params.page)
    else currentPage = 0

    /// Update page for pagination button click
    // Next Page
    if (clickedButton === 2) currentPage += 1
    // Next Page
    else if (clickedButton === 1 && currentPage === 0) currentPage += 1
    // Previous Page
    else if (clickedButton === 1 && currentPage === maxPage - 1) currentPage -= 1
    // Previous Page
    else if (clickedButton === 1) currentPage -= 1

    const contentFont = await loadGoogleFontAllVariants(
        config.slides[currentPage].content?.font || 'Roboto'
    )
    const titleFont = await loadGoogleFontAllVariants(
        config.slides[currentPage].title?.font || 'Inter'
    )

    if (currentPage > 0)
        buttons.push({
            label: '←',
        })
    if (currentPage < maxPage - 1)
        buttons.push({
            label: '→',
        })

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: config.slides[currentPage].aspect || '1:1',
        component: CoverView(config.slides[currentPage]),
        functionName: 'page',
        params: { page: currentPage },
    }
}
