'use server'

import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import { formatSymbol } from '../common/shared'
import CoverView from '../views/Cover'

export default async function initial({
    config,
}: {
    body: undefined
    config: Config
    storage: undefined
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const roboto = await loadGoogleFontAllVariants('Roboto')

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
        fonts: roboto,
        component: CoverView(config),
        handler: 'confirmation',
    }
}
