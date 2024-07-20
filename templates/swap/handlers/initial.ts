'use server'
import type { BuildFrameData, FrameButtonMetadata } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config } from '..'
import CoverView from '../views/Cover'
import PageView from '../views/Page'
import { formatSymbol } from '../utils/shared'

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

    console.log('Initial handler >> config:', config)

    if (config.pool) {
        const customFonts = await Promise.all([
            loadGoogleFontAllVariants('Inter'),
            loadGoogleFontAllVariants('Nunito'),
        ])

        fonts.push(...customFonts.flat())

        buttons.push({
            label: 'Swap',
        })

        const token0 = config.pool.primary === 'token0' ? config.pool.token0 : config.pool.token1
        const token1 = config.pool.primary === 'token0' ? config.pool.token1 : config.pool.token0

        console.log({ token0, token1 })

        for (const amount of config.amounts) {
            buttons.push({
                label: formatSymbol(amount, token1.symbol),
            })
        }

        return {
            buttons,
            inputText: `${token1.symbol} amount (eg. 0.1)`,
            fonts,
            component: PageView({ token0, token1, network: config.pool.network }),
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
