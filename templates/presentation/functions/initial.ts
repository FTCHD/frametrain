'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import CoverView from '../views/Cover'
import { type Config, type CustomButtons, PRESENTATION_DEFAULTS } from '../types'

export async function renderCustomButtons(
    customButtons: CustomButtons
): Promise<FrameButtonMetadata[]> {
    const buttons: FrameButtonMetadata[] = []

    // Render custom buttons
    for (const button of customButtons.slice(0, 4)) {
        switch (button.type) {
            case 'navigate': {
                buttons.push({
                    label: button?.text || '',
                })
                break
            }
            case 'link': {
                buttons.push({
                    action: 'link',
                    label: button?.text || 'Link',
                    target: button?.link || '',
                })
                break
            }
            case 'mint': {
                buttons.push({
                    action: 'mint',
                    label: button?.text || 'Mint NFT',
                    target: button?.nftID || '',
                })
                break
            }
        }
    }

    return buttons
}

export default async function initial(config: Config): Promise<BuildFrameData> {
    let c: Config

    if (Object.keys(config).includes('slides')) c = config
    else c = PRESENTATION_DEFAULTS

    const maxPage = Math.max(c.slides.length, 1)
    let buttons: FrameButtonMetadata[] = []

    const contentFont = await loadGoogleFontAllVariants(c.slides[0]?.content?.font || 'Roboto')
    const titleFont = await loadGoogleFontAllVariants(c.slides[0]?.title?.font || 'Inter')

    if (c.slides[0]?.buttons) {
        buttons = await renderCustomButtons(c.slides[0]?.buttons)
    } else if (maxPage > 1) {
        buttons.push({
            label: '→',
        })
    }

    return {
        buttons,
        fonts: [...contentFont, ...titleFont],
        aspectRatio: c.slides[0]?.aspect || '1:1',
        component: CoverView(c.slides[0]),
        functionName: 'page',
    }
}
