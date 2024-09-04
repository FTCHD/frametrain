'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import TextView from '@/sdk/views/TextView'
import type { Config } from '..'
import { formatSymbol } from '../common/shared'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const fontSet = new Set(['Roboto'])
    const fonts: any[] = []
    const buttons: FrameButtonMetadata[] = [
        {
            label: 'About',
        },
    ]

    if (config.cover.title?.fontFamily) {
        fontSet.add(config.cover.title.fontFamily)
    }

    if (config.cover.subtitle?.fontFamily) {
        fontSet.add(config.cover.subtitle.fontFamily)
    }

    if (config.cover.bottomMessage?.fontFamily) {
        fontSet.add(config.cover.bottomMessage.fontFamily)
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

    for (const font of fontSet) {
        const loadedFont = await loadGoogleFontAllVariants(font)
        fonts.push(...loadedFont)
    }

    return {
        inputText: config.token?.symbol
            ? `Donate custom ${config.token?.symbol} amount`
            : undefined,
        buttons,
        fonts,
        image: config.cover.image,
        component: config.cover.image ? undefined : TextView(config.cover),
        handler: 'confirmation',
    }
}
