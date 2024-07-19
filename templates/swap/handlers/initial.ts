'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import PageView from '../views/Page'

export default async function initial({
    config,
}: {
    config: Config

    body?: undefined
    storage?: Storage
    params?: any
}): Promise<BuildFrameData> {
    const buttons: FrameButtonMetadata[] = []
    const fonts = []

    if (config.pool) {
        const customFonts = await Promise.all([
            loadGoogleFontAllVariants('Inter'),
            loadGoogleFontAllVariants('Nunito'),
        ])

        fonts.push(...customFonts.flat())

        buttons.push({
            label: 'Swap',
        })

        for (const amount of config.amounts) {
            buttons.push({
                label: `$${config.pool.token0.symbol} ${amount}`,
            })
        }

        return {
            buttons,
            inputText: `${config.pool.token0.symbol} amount to swap(eg. 0.1)`,
            fonts,
            component: PageView(config.pool),
            handler: 'price',
        }
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')

    return {
        buttons,
        fonts: roboto,
        component: CoverView(config),
    }
}
