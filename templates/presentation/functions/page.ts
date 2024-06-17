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
    const contentFont = await loadGoogleFontAllVariants(config.content?.font || 'Roboto')

    const clickedButton = body?.untrustedData?.buttonIndex

    /* Pagination */
    const texts: string[] = config.content?.text || []
    const title: string = config.title?.text || ''
    const buttons: FrameButtonMetadata[] = []

    let maxPage = texts?.length + (title ? 1 : 0)
    if (config?.type === "image") maxPage = config?.images?.length;

    let currentPage: number

    if (params?.page) currentPage = Number(params.page)
    else if (!title && texts.length && !params?.page) currentPage = 1
    else if (!title && texts.length) currentPage = params.page - 1
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
        fonts: contentFont,
        aspectRatio: config?.type === "image" ? (config?.aspect || '1:1') : '1:1',
        component: CoverView(config, currentPage),
        functionName: 'page',
        params: { page: currentPage },
    }
}
