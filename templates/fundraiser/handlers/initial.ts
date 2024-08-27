'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { formatSymbol } from '../common/shared'
import TextSlide from '@/sdk/components/TextSlide'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const roboto = await loadGoogleFontAllVariants('Roboto')
    const fonts = [...roboto]
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'About',
        },
    ]

    if (config.cover.title?.fontFamily) {
        const titleFont = await loadGoogleFontAllVariants(config.cover.title.fontFamily)
        fonts.push(...titleFont)
    }

    if (config.cover.subtitle?.fontFamily) {
        const subtitleFont = await loadGoogleFontAllVariants(config.cover.subtitle.fontFamily)
        fonts.push(...subtitleFont)
    }

    if (config.cover.bottomMessage?.fontFamily) {
        const customFont = await loadGoogleFontAllVariants(config.cover.bottomMessage.fontFamily)
        fonts.push(...customFont)
    }

    if (config.token?.symbol && config.enablePredefinedAmounts && config.amounts.length) {
        for (const amount of config.amounts) {
            buttons.push({
                label: formatSymbol(amount, config.token.symbol),
            })
        }

        buttons.push({
            label: 'Custom',
        })
    } else {
        buttons.push({
            label: 'Donate',
        })
    }

    return {
        inputText: config.token?.symbol
            ? `Donate custom ${config.token?.symbol} amount`
            : undefined,
        buttons,
        fonts,
        image: config.cover.image,
        component: config.cover.image ? undefined : TextSlide(config.cover),
        handler: 'confirmation',
    }
}
